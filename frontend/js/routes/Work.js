import React from 'react';
import * as WorkViews from '../ui/WorkViews';
import {App} from '../layouts';
import {isSpecialWork} from '../util';

const POSTS_PER_PAGE = 10;

function Work({data, writeData, loader}) {
    const {
        work,
        chart,
        episode,
        posts,
        hasMorePosts,
        currentUser,
    } = data;
    const isSpecial = isSpecialWork(work);

    async function loadMorePosts() {
        var params = {count: POSTS_PER_PAGE + 1};
        if (posts && posts.length > 0)
            params.before_id = posts[posts.length - 1].id;
        if (episode)
            params.episode = episode;
        const result = await loader.callNew(`/works/${work.id}/posts`, params);
        writeData(data => {
            data.posts = data.posts.concat(result.slice(0, POSTS_PER_PAGE));
            data.hasMorePosts = result.length > POSTS_PER_PAGE;
        });
    }

    function applyRecord(record) {
        writeData(data => {
            data.work.record = record;
        });
    }

    return <WorkViews.Work
        work={work}
        chart={chart}
        currentUser={currentUser}
        onRecordChange={applyRecord}
    >
        {!isSpecial && <WorkViews.Episodes
            work={work}
            activeEpisodeNumber={episode}
        />}
        <WorkViews.WorkIndex
            work={work}
            episode={episode}
            posts={posts}
            hasMorePosts={hasMorePosts}
            loadMorePosts={loadMorePosts}
        />
    </WorkViews.Work>;
}

const Component = App(Work);

export default {
    component: (props) => {
        return <Component
            {...props}
            globalHeaderProps={{mobileSpecial: true}}
        />;
    },

    async load({ params, loader }) {
        const {title, episode} = params;
        const [currentUser, work, chart] = await Promise.all([
            loader.getCurrentUser(),
            loader.call(`/works/_/${encodeURIComponent(title)}`),
            loader.callNew('/charts/works/weekly', {limit: 5}),
        ]);
        const postsParams = {count: POSTS_PER_PAGE + 1};
        if (episode)
            postsParams.episode = episode;
        const posts = await loader.callNew(`/works/${work.id}/posts`, postsParams);
        return {
            currentUser,
            work,
            chart,
            posts: posts.slice(0, POSTS_PER_PAGE),
            episode,
            hasMorePosts: posts.length > POSTS_PER_PAGE,
        };
    },

    renderTitle({ work, episode }) {
        var pageTitle = work.title;
        if (episode) {
            pageTitle += ` ${episode}화`;
        }
        return pageTitle;
    },

    renderMeta({ work }) {
        const title = work.title;
        return {
            og_url: `/works/${encodeURIComponent(title)}/`,
            og_type: 'tv_show',
            og_image: work.image_url,
            tw_image: work.image_url,
        };
    }
};
