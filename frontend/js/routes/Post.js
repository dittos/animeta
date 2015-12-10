import React from 'react';
import {createContainer} from '../Isomorphic';
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

export default createContainer(Post, {
    getPreloadKey({ params }) {
        return `post/${params.id}`;
    },

    async fetchData(client, props) {
        const {id} = props.params;
        const post = await client.call(`/posts/${id}`);
        const [work, chart] = await* [
            client.call(`/works/${post.record.work_id}`),
            client.call('/charts/works/weekly', {limit: 5}),
        ];
        return {
            work,
            chart,
            post
        };
    },

    getTitle(props, data) {
        return `${data.post.user.name} 사용자 > ${data.work.title} ${getStatusDisplay(data.post)}`;
    }
});
