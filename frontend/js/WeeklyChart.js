var React = require('react');
var util = require('./util');

var WeeklyChart = React.createClass({
    render() {
        return <div className="weekly-chart">
            <h3 className="section-title">주간 인기 작품</h3>
            {this.props.data.map(item => {
                var diff;
                if (item.diff) {
                    if (item.sign === -1) {
                        diff = <span className="down"><i className="fa fa-arrow-down" /> {item.diff}</span>;
                    } else if (item.sign === +1) {
                        diff = <span className="up"><i className="fa fa-arrow-up" /> {item.diff}</span>;
                    }
                }
                var work = item.object;
                return <a href={util.getWorkURL(work.title)}
                    className="chart-item">
                    <div className="chart-item-text">
                        <span className="rank">{item.rank}위</span>
                        <span className="title">{work.title}</span>
                        {diff}
                    </div>
                    {work.metadata &&
                        <img src={work.metadata.image_url} />}
                </a>;
            })}
        </div>;
    }
});

module.exports = WeeklyChart;
