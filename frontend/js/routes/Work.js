import React from 'react';
import {createContainer} from '../Isomorphic';
import WorkViews from '../ui/WorkViews';

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

export default createContainer(Work, {
    getPreloadKey({ params }) {
        return `work/${params.splat}`;
    },

    async fetchData(client, props) {
        const {splat: title} = props.params;
        const [work, chart] = await* [
            client.call('/works/_/' + encodeURIComponent(title)),
            client.call('/charts/works/weekly', {limit: 5}),
        ];
        return {
            work,
            chart
        };
    }
});
