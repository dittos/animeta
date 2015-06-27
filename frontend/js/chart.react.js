import React from "react";
import GlobalHeader from "./GlobalHeader";
import Layout from "./Layout";
require('../less/chart.less');

class Header extends React.Component {
    render() {
        return <div className="chart-header">
            <h1 className="chart-section-title">순위</h1>
            <p className="chart-nav">{'인기 작품: '}
                <a href="/charts/works/overall/">전체</a>{', '}
                <a href="/charts/works/monthly/">월간</a>{', '}
                <a href="/charts/works/weekly/">주간</a>
            </p>
            <p className="chart-nav">{'활발한 사용자: '}
                <a href="/charts/users/overall/">전체</a>{', '}
                <a href="/charts/users/monthly/">월간</a>{', '}
                <a href="/charts/users/weekly/">주간</a>
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

class Chart extends React.Component {
    render() {
        var chart = this.props.chart;
        return (
            <div>
                <GlobalHeader currentUser={this.props.current_user} />
                <Layout.CenteredFullWidth>
                    <Header />
                    <div className="chart-content">
                        <h2 className="chart-title">{this.props.title}</h2>
                        {chart.start ?
                            <p>{'기간: '}{chart.start} &ndash; {chart.end}</p>
                            : <p>기간: 전체</p>}
                        <table className="chart-table">
                        {chart.items.map(item => <tr>
                            <td className="rank">{item.rank}</td>
                            {this.props.has_diff &&
                                <td className="diff">{renderDiff(item)}</td>}
                            <td className="name"><a href={item.object.link}>{item.object.text}</a></td>
                            <td className="bar"><div style={{width: item.factor_percent + '%'}} /></td>
                            <td className="factor">{item.factor}</td>
                        </tr>)}
                        </table>
                    </div>
                </Layout.CenteredFullWidth>
            </div>
        );
    }
}

React.render(<Chart {...global.PreloadData} />,
    document.getElementById('app'));
