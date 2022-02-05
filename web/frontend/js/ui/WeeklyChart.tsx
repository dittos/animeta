import React from 'react';
import { Link } from 'nuri';
import { getWorkURL } from '../util';
import Styles from './WeeklyChart.less';
import { ChartItem, ChartItemWork } from '../../../shared/types';

export type WeeklyChartItem = ChartItem<ChartItemWork>;

function WeeklyChart({ data }: {
  data: WeeklyChartItem[]
}) {
  return (
    <div>
      {data.map(item => {
        var diff;
        if (item.diff) {
          if (item.sign === -1) {
            diff = (
              <span className={Styles.down}>
                <i className="fa fa-arrow-down" /> {item.diff}
              </span>
            );
          } else if (item.sign === +1) {
            diff = (
              <span className={Styles.up}>
                <i className="fa fa-arrow-up" /> {item.diff}
              </span>
            );
          }
        }
        var work = item.object;
        return (
          <Link key={work.id} to={getWorkURL(work.title)} className={Styles.item}>
            {work.image_url && (
              <div className={Styles.poster}>
                <img src={work.image_url} className={Styles.posterImage} />
              </div>
            )}
            <div className={Styles.content}>
              <div className={Styles.title}>{work.title}</div>
              {diff ? (
                <div className={Styles.rank}>
                  {item.rank}위 &middot; {diff}
                </div>
              ) : (
                <div className={Styles.rank}>
                  {item.rank}위
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default WeeklyChart;
