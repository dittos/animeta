import React from 'react';
import {Link} from 'nuri';
import {getWorkURL} from '../util';
import Styles from './WeeklyChart.less';
// TODO: css module

function WeeklyChart({ data }) {
    return <div>
        {data.map(item => {
            var diff;
            if (item.diff) {
                if (item.sign === -1) {
                    diff = <span className="down"><i className="fa fa-arrow-down" /> {item.diff}</span>;
                } else if (item.sign === +1) {
                    diff = <span className="up"><i className="fa fa-arrow-up" /> {item.diff}</span>;
                }
            }
            var work = item.object;
            return <Link to={getWorkURL(work.title)}
                className={Styles.item}>
                <div className="chart-item-text">
                    <span className="rank">{item.rank}위</span>
                    <span className="title">{work.title}</span>
                    {diff}
                </div>
                {work.image_url &&
                    <img src={work.image_url} />}
            </Link>;
        })}
    </div>;
}

export default WeeklyChart;
