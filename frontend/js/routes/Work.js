import React from 'react';
import WorkViews from '../ui/WorkViews';
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
    } = data;

    async function loadMorePosts() {
        var params = {count: POSTS_PER_PAGE + 1};
        if (posts && posts.length > 0)
            params.before_id = posts[posts.length - 1].id;
        if (episode)
            params.episode = episode;
        const result = await loader.call(`/works/${work.id}/posts`, params);
        writeData(data => {
            data.posts = data.posts.concat(result.slice(0, POSTS_PER_PAGE));
            data.hasMorePosts = result.length > POSTS_PER_PAGE;
        });
    }

    return <WorkViews.Work
        work={work}
        chart={chart}
    >
        <WorkViews.Episodes
            work={work}
            activeEpisodeNumber={episode}
        />
        <WorkViews.WorkIndex
            work={work}
            episode={episode}
            posts={posts}
            hasMorePosts={hasMorePosts}
            loadMorePosts={loadMorePosts}
        />
    </WorkViews.Work>;
}

export default {
    component: (props) => {
        const Component = App(Work);
        return <Component
            {...props}
            globalHeaderProps={{mobileSpecial: isSpecialWork(props.data.work)}}
        />;
    },

    async load({ params, loader }) {
        const {title, episode} = params;
        const [currentUser, work, chart] = await Promise.all([
            loader.getCurrentUser(),
            loader.call(`/works/_/${encodeURIComponent(title)}`),
            loader.call('/charts/works/weekly', {limit: 5}),
        ]);
        const postsParams = {count: POSTS_PER_PAGE + 1};
        if (episode)
            postsParams.episode = episode;
        const posts = await loader.call(`/works/${work.id}/posts`, postsParams);
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
