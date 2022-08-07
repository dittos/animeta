import { RouteComponentProps, RouteHandler } from '../routes';
import React from 'react';
import { User as UserLayout } from '../layouts';
import * as Layout from '../ui/Layout';
import * as Grid from '../ui/Grid';
import Styles from '../../less/table-period.less';
import { TableItem } from '../ui/TableItem';
import { formatPeriod } from '../util';
import { Link } from 'nuri';
import { UserLayoutPropsData } from '../ui/UserLayout';
import { isRecommendationEnabled } from './Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { UserTableRouteDocument, UserTableRouteQuery } from './__generated__/UserTable.graphql';

type TablePeriodItem = UserTableRouteQuery['tablePeriod'][number]

type UserTableRouteData = UserTableRouteQuery & UserLayoutPropsData & {
  period: string;
  items: TablePeriodItem[];
};

class UserTable extends React.Component<RouteComponentProps<UserTableRouteData>> {
  // TODO: extract stuck detect component
  private sentinelEl: Element | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  state = {
    isHeaderStuck: false,
  };

  componentDidMount() {
    if (window.IntersectionObserver) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        const stuck = !entries[0].isIntersecting
        this.setState({ isHeaderStuck: stuck })
      }, {threshold: [0], rootMargin: '-48px 0px 0px 0px'});
      this.intersectionObserver.observe(this.sentinelEl!)
    }
  }

  componentWillUnmount() {
    if (this.intersectionObserver)
      this.intersectionObserver.disconnect();
  }

  render() {
    const { items, period } = this.props.data;
    return (
      <div className={Styles.container}>
        <div ref={el => this.sentinelEl = el} />
        <Layout.CenteredFullWidth className={this.state.isHeaderStuck ? Styles.stuckHeaderContainer : Styles.headerContainer}>
          <div className={Styles.userHeader}>
            <div className={Styles.userPageTitle}>
              {formatPeriod(period)} 신작
            </div>
            <Link to={`/table/${period}/`} className={Styles.fullTableLink}>전체 작품 보기 <FontAwesomeIcon icon={faChevronRight} /></Link>
          </div>
        </Layout.CenteredFullWidth>
        {items.length > 0 ? (
          <Grid.Row className={Styles.items}>
            {items.map((item, i) => (
              <>
                <Grid.Column size={6} midSize={12} pull="left">
                  <TableItem key={item.work.id} item={item} onAddRecord={this._recordAdded} />
                </Grid.Column>
                {i % 2 === 1 && <div style={{ clear: 'both' }} />}
              </>
            ))}
          </Grid.Row>
        ) : (
          <Grid.Row className={Styles.itemsEmpty}>
            <p>추가한 작품이 없습니다.</p>

            <p><Link to={`/table/${period}/`} className={Styles.fullTableLink}>전체 작품 보기 <FontAwesomeIcon icon={faChevronRight} /></Link></p>
          </Grid.Row>
        )}
      </div>
    )
  }

  private _recordAdded = () => {
  };
}

const routeHandler: RouteHandler<UserTableRouteData> = {
  component: UserLayout(UserTable, { noContentWrapper: true }, { noHero: true, noNotice: true }),

  async load({ loader, params }) {
    const { username, period } = params;
    const [currentUser, user, data] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.callV4(`/users/${encodeURIComponent(username)}`, {
        options: {
          stats: true,
          categories: true,
        },
      }),
      loader.graphql(UserTableRouteDocument, {
        period,
        username,
        withRecommendations: isRecommendationEnabled(period),
      }),
    ]);
    return {
      ...data,
      currentUser,
      user,
      period,
      items: data.tablePeriod,
    };
  },

  renderTitle({ user, period }) {
    return `${formatPeriod(period)} 신작 - ${user.name} 사용자`;
  },
  
  renderMeta({ user, period }) {
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
