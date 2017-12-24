import React from 'react';
import {Link} from 'nuri';
import {getWorkURL} from '../util';
import Styles from './WeeklyChart.less';

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
                className={Styles.item}
                style={work.image_url ? {
                    backgroundImage: `url("${work.image_url}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: `0 ${work.image_center_y * 100}%`,
                    backgroundRepeat: 'no-repeat',
                } : {}}>
                <div className="chart-item-text">
                    <span className="rank">{item.rank}위</span>
                    <span className="title">{work.title}</span>
                    {diff}
                </div>
            </Link>;
        })}
    </div>;
}

export default WeeklyChart;
