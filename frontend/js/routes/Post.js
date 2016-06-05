import React from 'react';
import WorkViews from '../ui/WorkViews';
import {getStatusDisplay} from '../util';

function Post({ model }) {
    const { work, chart, post } = model;
    return (
        <WorkViews.Work
            work={work}
            chart={chart}
        >
            <WorkViews.Episodes
                work={work}
                activeEpisodeNumber={post.status}
            />
            <div className="post-detail">
                <WorkViews.Post post={post} />
            </div>
            <WorkViews.WorkIndex
                work={work}
                episode={post.status}
                excludePostID={post.id} />
        </WorkViews.Work>
    );
}

export default {
    component: Post,

    async model({ params, client }) {
        const {id} = params;
        const [currentUser, post, chart] = await Promise.all([
            client.getCurrentUser(),
            client.call(`/posts/${id}`),
            client.call('/charts/works/weekly', {limit: 5}),
        ]);
        const work = await client.call(`/works/${post.record.work_id}`);
        return {
            currentUser,
            post,
            chart,
            work,
        };
    },

    renderTitle({ post, work }) {
        return `${post.user.name} 사용자 > ${work.title} ${getStatusDisplay(post)}`;
    },

    renderMeta({ post, work }) {
        return {
            og_url: `/-${post.id}`,
            og_type: 'article',
            og_image: work.metadata && work.metadata.image_url,
            tw_image: work.metadata && work.metadata.image_url,
        };
    }
}
