import React from 'react';
import WorkViews from '../ui/WorkViews';

const POSTS_PER_PAGE = 10;

function Work({
    work,
    chart,
    episode,
    posts,
}) {
    return <WorkViews.Work
        work={work}
        chart={chart}
    >
        <WorkViews.Episodes
            work={work}
            activeEpisodeNumber={episode}
        />
        <WorkViews.WorkIndex
            pageSize={POSTS_PER_PAGE}
            work={work}
            initialPosts={posts}
            hasMore={posts.length > POSTS_PER_PAGE}
            episode={episode}
        />
    </WorkViews.Work>;
}

Work.fetchData = async ({ params, client }) => {
    const {title, episode} = params;
    const [currentUser, work, chart] = await Promise.all([
        client.getCurrentUser(),
        client.call(`/works/_/${encodeURIComponent(title)}`),
        client.call('/charts/works/weekly', {limit: 5}),
    ]);
    const postsParams = {count: POSTS_PER_PAGE + 1};
    if (episode)
        postsParams.episode = episode;
    const posts = await client.call(`/works/${work.id}/posts`, postsParams);
    var pageTitle = work.title;
    if (episode) {
        pageTitle += ` ${episode}화`;
    }
    return {
        pageTitle,
        pageMeta: {
            og_url: `/works/${encodeURIComponent(title)}/`,
            og_type: 'tv_show',
            og_image: work.image_url,
            tw_image: work.image_url,
        },
        props: {
            currentUser,
            work,
            chart,
            posts,
            episode,
        }
    };
};

export default Work;
