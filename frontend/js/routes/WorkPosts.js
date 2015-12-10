import React from 'react';
import {createContainer} from '../Isomorphic';
import WorkViews from '../ui/WorkViews';

const POSTS_PER_PAGE = 10;

var WorkPosts = React.createClass({
    render() {
        return <WorkViews.WorkIndex
            pageSize={POSTS_PER_PAGE}
            work={this.props.work}
            initialPosts={this.props.posts}
            hasMore={this.props.posts.length > POSTS_PER_PAGE}
            episode={this.props.params.episode}
        />;
    }
});

export default createContainer(WorkPosts, {
    getPreloadKey({ params }) {
        return `work/${params.splat}/posts/${params.episode}`;
    },

    async fetchData(client, props) {
        const {splat: title, episode} = props.params;
        const work = await client.call('/works/_/' + encodeURIComponent(title));
        const params = {count: POSTS_PER_PAGE + 1};
        if (episode) {
            params.episode = episode;
        }
        const posts = await client.call(`/works/${work.id}/posts`, params);
        return {
            work,
            posts,
        };
    },

    getTitle(props, data) {
        var title = data.work.title;
        const episode = props.params.episode;
        if (episode) {
            title += ` ${episode}화`;
        }
        return title;
    },

    getMeta(props, data) {
        const work = data.work;
        const title = work.title;
        return {
            og_url: `/works/${encodeURIComponent(title)}/`,
            og_type: 'tv_show',
            og_image: work.metadata && work.metadata.image_url,
            tw_image: work.metadata && work.metadata.image_url,
        }
    }
});
