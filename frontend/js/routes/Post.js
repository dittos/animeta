import React from 'react';
import WorkViews from '../ui/WorkViews';
import {getStatusDisplay} from '../util';

var Post = React.createClass({
    render() {
        const {work, chart, post} = this.props;
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
});

Post.fetchData = async ({ params, client }) => {
    const {id} = params;
    const [currentUser, post, chart] = await Promise.all([
        client.getCurrentUser(),
        client.call(`/posts/${id}`),
        client.call('/charts/works/weekly', {limit: 5}),
    ]);
    const work = await client.call(`/works/${post.record.work_id}`);
    return {
        pageTitle: `${post.user.name} 사용자 > ${work.title} ${getStatusDisplay(post)}`,
        pageMeta: {
            og_url: `/-${post.id}`,
            og_type: 'article',
            og_image: work.image_url,
            tw_image: work.image_url,
        },
        props: {
            currentUser,
            post,
            chart,
            work,
        }
    };
};

export default Post;
