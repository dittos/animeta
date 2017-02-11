import React from 'react';
import {Link} from 'nuri';
import {App} from '../layouts';
import * as Layout from '../ui/Layout';
// TODO: css module

class Header extends React.Component {
    render() {
        return <div className="chart-header">
            <h1 className="chart-section-title">순위</h1>
            <p className="chart-nav">{'인기 작품: '}
                <Link to="/charts/works/overall/">전체</Link>{', '}
                <Link to="/charts/works/monthly/">월간</Link>{', '}
                <Link to="/charts/works/weekly/">주간</Link>
            </p>
            <p className="chart-nav">{'활발한 사용자: '}
                <Link to="/charts/users/overall/">전체</Link>{', '}
                <Link to="/charts/users/monthly/">월간</Link>{', '}
                <Link to="/charts/users/weekly/">주간</Link>
            </p>
        </div>;
    }
}

function renderDiff(item) {
    if (!item.diff)
        return null;
    if (item.sign === 0)
        return '-'
    else {
        var diff = [item.diff];
        if (item.sign === -1)
            diff.push(<span className="down">&darr;</span>);
        else
            diff.push(<span className="up">&uarr;</span>);
        return diff;
    }
}

class ChartLayout extends React.Component {
    render() {
        return (
            <Layout.CenteredFullWidth>
                <Header />
                <div className="chart-content">
                    {this.props.children}
                </div>
            </Layout.CenteredFullWidth>
        );
    }
}

function getChartTitle(chart, range) {
    var title = '';
    if (range === 'weekly')
        title = '주간 ';
    else if (range === 'monthly')
        title = '월간 ';
    title += chart.title;
    return title;
}

class Chart extends React.Component {
    render() {
        const {
            chart,
            range,
        } = this.props.data;
        return <ChartLayout>
            <h2 className="chart-title">{getChartTitle(chart, range)}</h2>
            {chart.start ?
                <p>{'기간: '}{chart.start} &ndash; {chart.end}</p>
                : <p>기간: 전체</p>}
            <table className="chart-table">
                <tbody>
                {chart.items.map(item => <tr>
                    <td className="rank">{item.rank}</td>
                    {chart.has_diff &&
                        <td className="diff">{renderDiff(item)}</td>}
                    <td className="name">
                        <Link to={item.object.link}>{item.object.text}</Link>
                    </td>
                    <td className="bar"><div style={{width: item.factor_percent + '%'}} /></td>
                    <td className="factor">{item.factor}</td>
                </tr>)}
                </tbody>
            </table>
        </ChartLayout>;
    }
}

const CHART_TYPES = {
    'users': 'active-users',
    'works': 'popular-works',
};

export default {
    component: App(Chart),

    async load({ params, loader }) {
        const {type, range} = params;
        const [currentUser, chart] = await Promise.all([
            loader.getCurrentUser(),
            loader.call(`/charts/${CHART_TYPES[type]}/${range}`, {limit: 100}),
        ]);
        return {
            currentUser,
            chartType: type,
            chart,
            range,
        };
    },

    renderTitle({ chart, range }) {
        return getChartTitle(chart, range);
    }
};
