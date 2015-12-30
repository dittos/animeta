import React from 'react';
import {createContainer} from '../Isomorphic';
import WorkViews from '../ui/WorkViews';
import {fetch} from '../store/FetchActions';

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

function fetchWorkByTitle(title) {
    return fetch(`work/${title}`,
        `/works/_/${encodeURIComponent(title)}`);
}

function fetchWorkPosts(work, params) {
    const {episode} = params;
    return fetch(`/works/${work.id}/posts/${episode}`,
        `/works/${work.id}/posts`, params);
}

export default createContainer(WorkPosts, {
    select(state, props) {
        const {splat: title, episode} = props.params;
        const work = state.fetches[`work/${title}`];
        return {
            work,
            posts: state.fetches[`/works/${work.id}/posts/${episode}`],
        };
    },

    async fetchData(getState, dispatch, props) {
        const {splat: title, episode} = props.params;
        await dispatch(fetchWorkByTitle(title));
        const work = getState().fetches[`work/${title}`];
        await dispatch(fetchWorkPosts(work, {
            count: POSTS_PER_PAGE + 1,
            episode
        }));
    },

    getTitle(parentTitle, state, props) {
        const {splat: workTitle, episode} = props.params;
        const work = state.fetches[`work/${workTitle}`];
        var title = work.title;
        if (episode) {
            title += ` ${episode}화`;
        }
        return title;
    },

    getMeta(state, props) {
        const {splat: workTitle} = props.params;
        const work = state.fetches[`work/${workTitle}`];
        const title = work.title;
        return {
            og_url: `/works/${encodeURIComponent(title)}/`,
            og_type: 'tv_show',
            og_image: work.metadata && work.metadata.image_url,
            tw_image: work.metadata && work.metadata.image_url,
        }
    }
});
