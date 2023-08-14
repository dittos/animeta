import { RouteComponentProps, RouteHandler } from '../routes';
import React, { useRef } from 'react';
import { User as UserLayout } from '../layouts';
import * as Layout from '../ui/Layout';
import * as Grid from '../ui/Grid';
import Styles from '../../less/table-period.less';
import { TableItem } from '../ui/TableItem';
import { formatPeriod } from '../util';
import { Link } from 'nuri';
import { UserLayoutPropsData } from '../ui/UserLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { UserTableRouteDocument, UserTableRouteQuery } from './__generated__/UserTable.graphql';
import useIntersectionObserver from '../ui/useIntersectionObserver';

type UserTableRouteData = UserTableRouteQuery & UserLayoutPropsData & {
  tablePeriod: NonNullable<UserTableRouteQuery['tablePeriod']>;
};

const UserTable: React.FC<RouteComponentProps<UserTableRouteData>> = ({ data }) => {
  const sentinelEl = useRef<HTMLDivElement | null>(null)
  const entry = useIntersectionObserver(sentinelEl, {
    threshold: [0],
    rootMargin: '-48px 0px 0px 0px',
  })
  const isHeaderStuck = entry ? !entry.isIntersecting : false

  const { tablePeriod } = data
  const { items } = tablePeriod
  return (
    <div className={Styles.container}>
      <div ref={sentinelEl} />
      <Layout.CenteredFullWidth className={isHeaderStuck ? Styles.stuckHeaderContainer : Styles.headerContainer}>
        <div className={Styles.userHeader}>
          <div className={Styles.userPageTitle}>
            {formatPeriod(tablePeriod)} 신작
          </div>
          <Link to={`/table/${tablePeriod.period}/`} className={Styles.fullTableLink}>전체 작품 보기 <FontAwesomeIcon icon={faChevronRight} /></Link>
        </div>
      </Layout.CenteredFullWidth>
      {items.length > 0 ? (
        <Grid.Row className={Styles.items}>
          {items.map((item, i) => (
            <>
              <Grid.Column size={6} midSize={12} pull="left">
                <TableItem key={item.work.id} item={item} onAddRecord={() => {}} />
              </Grid.Column>
              {i % 2 === 1 && <div style={{ clear: 'both' }} />}
            </>
          ))}
        </Grid.Row>
      ) : (
        <Grid.Row className={Styles.itemsEmpty}>
          <p>추가한 작품이 없습니다.</p>

          <p><Link to={`/table/${tablePeriod.period}/`} className={Styles.fullTableLink}>전체 작품 보기 <FontAwesomeIcon icon={faChevronRight} /></Link></p>
        </Grid.Row>
      )}
    </div>
  )
}

const routeHandler: RouteHandler<UserTableRouteData> = {
  component: UserLayout(UserTable, { noContentWrapper: true }, { noHero: true, noNotice: true }),

  async load({ loader, params }) {
    const { username, period } = params;
    const {user, tablePeriod, ...data} = await loader.graphql(UserTableRouteDocument, {
      period,
      username,
      withRecommendations: true,
    });
    if (!tablePeriod) throw new Error('not found')
    if (!user) {
      // TODO: 404
    }
    return {
      ...data,
      tablePeriod,
      user: user!,
    };
  },

  renderTitle({ user, tablePeriod }) {
    return `${formatPeriod(tablePeriod)} 신작 - ${user.name} 사용자`;
  },
  
  renderMeta({ user, tablePeriod }) {
    const period = tablePeriod.period
    return {
      og_url: `/users/${user.name}/table/${period}/`,
      tw_url: `/users/${user.name}/table/${period}/`,
      description: `${user.name}님의 관심 작품을 확인해 보세요.`,
      og_image_static: `share-table-q${period.split('Q')[1]}.jpg`,
      tw_card_type: 'summary_large_image',
      tw_image_static: `share-table-q${period.split('Q')[1]}.jpg`,
    };
  },
};
export default routeHandler;
