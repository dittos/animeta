import { RouteComponentProps, RouteHandler } from 'nuri/app';
import React from 'react';
import { User as UserLayout } from '../layouts';
import * as Layout from '../ui/Layout';
import * as Grid from '../ui/Grid';
import Styles from '../../less/table-period.less';
import { TableItem } from '../ui/TableItem';
import { UserDTO, WorkDTO } from '../types';
import { formatPeriod } from '../util';
import { Link } from 'nuri';

type UserTableRouteData = {
  currentUser?: UserDTO;
  user: UserDTO;
  period: string;
  items: WorkDTO[];
};

class UserTable extends React.Component<RouteComponentProps<UserTableRouteData>> {
  // TODO: extract stuck detect component
  private sentinelEl: Element | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  state = {
    isHeaderStuck: false,
  };

  componentDidMount() {
    if ((window as any).IntersectionObserver) {
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
            <Link to={`/table/${period}/`} className={Styles.fullTableLink}>전체 작품 보기 <i className="fa fa-chevron-right" /></Link>
          </div>
        </Layout.CenteredFullWidth>
        {items.length > 0 ? (
          <Grid.Row className={Styles.items}>
            {items.map((item, i) => (
              <>
                <Grid.Column size={6} midSize={12} pull="left">
                  <TableItem key={item.id} item={item} onAddRecord={this._recordAdded} />
                </Grid.Column>
                {i % 2 === 1 && <div style={{ clear: 'both' }} />}
              </>
            ))}
          </Grid.Row>
        ) : (
          <Grid.Row className={Styles.itemsEmpty}>
            <p>추가한 작품이 없습니다.</p>

            <p><Link to={`/table/${period}/`} className={Styles.fullTableLink}>전체 작품 보기 <i className="fa fa-chevron-right" /></Link></p>
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

  async load({ loader, params, query }) {
    const { username, period } = params;
    const [currentUser, user, items] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.call(`/users/${encodeURIComponent(username)}`, {
        options: {
          stats: true,
          categories: true,
        },
      }),
      loader.call(`/table/periods/${period}`, {
        only_first_period: JSON.stringify(true),
        only_added: JSON.stringify(true),
        username,
      }),
    ]);
    return {
      currentUser,
      user,
      period,
      items,
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
