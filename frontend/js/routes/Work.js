import React from 'react';
import {createContainer} from '../Isomorphic';
import WorkViews from '../ui/WorkViews';
import {fetch} from '../store/FetchActions';
import {loadSidebarChart} from '../store/AppActions';

var Work = React.createClass({
    render() {
        var work = this.props.work;
        return <WorkViews.Work
            work={work}
            chart={this.props.chart}
        >
            <WorkViews.Episodes work={work} />
            {this.props.children}
        </WorkViews.Work>;
    }
});

function fetchWorkByTitle(title) {
    return fetch(`work/${title}`,
        `/works/_/${encodeURIComponent(title)}`);
}

export default createContainer(Work, {
    select(state, props) {
        const {splat: title} = props.params;
        return {
            work: state.fetches[`work/${title}`],
            chart: state.app.sidebarChart,
        };
    },

    fetchData(getState, dispatch, props) {
        const {splat: title} = props.params;
        return Promise.all([
            dispatch(fetchWorkByTitle(title)),
            dispatch(loadSidebarChart()),
        ]);
    },

    hasCachedData(state, props) {
        const {splat: title} = props.params;
        return state.fetches[`work/${title}`] && state.app.sidebarChart;
    }
});
