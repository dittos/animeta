import React from 'react';
import { Link } from 'nuri';
import { getWorkURL } from '../util';
import Styles from './WeeklyChart.less';
import { ChartItem, ChartItemWork } from '../../../shared/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { WeeklyChartFragment } from './__generated__/GqlWeeklyChart.graphql';

export type WeeklyChartItem = ChartItem<ChartItemWork>;

export function GqlWeeklyChart({ data }: {
  data: WeeklyChartFragment,
}) {
  return (
    <div>
      {data.weeklyWorksChart!.map(item => {
        var diff;
        if (item.diff) {
          if (item.sign === -1) {
            diff = (
              <span className={Styles.down}>
                <FontAwesomeIcon icon={faArrowDown} /> {item.diff}
              </span>
            );
          } else if (item.sign === +1) {
            diff = (
              <span className={Styles.up}>
                <FontAwesomeIcon icon={faArrowUp} /> {item.diff}
              </span>
            );
          }
        }
        var work = item.work;
        return (
          <Link key={work.id} to={getWorkURL(work.title!)} className={Styles.item}>
            {work.imageUrl && (
              <div className={Styles.poster}>
                <img src={work.imageUrl} className={Styles.posterImage} />
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
