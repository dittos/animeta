import React from 'react';
import {createContainer} from '../Isomorphic';
import WorkViews from '../ui/WorkViews';
import {getStatusDisplay} from '../util';
import {fetch} from '../store/FetchActions';
import {loadSidebarChart} from '../store/AppActions';

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

function fetchPostByIDWithWork(id) {
    return (dispatch) => {
        return dispatch(fetch(`posts/${id}`, `/posts/${id}`)).then(post => {
            return dispatch(fetch(`work?id/${post.record.work_id}`, `/works/${post.record.work_id}`));
        });
    };
}

export default createContainer(Post, {
    select(state, props) {
        const {id} = props.params;
        const post = state.fetches[`posts/${id}`];
        const work = state.fetches[`work?id/${post.record.work_id}`];
        return {
            post,
            work,
            chart: state.app.sidebarChart,
        };
    },

    fetchData(getState, dispatch, props) {
        const {id} = props.params;
        return Promise.all([
            dispatch(fetchPostByIDWithWork(id)),
            dispatch(loadSidebarChart()),
        ]);
    },

    getTitle(parentTitle, state, props) {
        const {id} = props.params;
        const post = state.fetches[`posts/${id}`];
        const work = state.fetches[`work?id/${post.record.work_id}`];
        return `${post.user.name} 사용자 > ${work.title} ${getStatusDisplay(post)}`;
    }
});
