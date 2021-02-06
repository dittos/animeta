import React from 'react';
import sortBy from 'lodash/sortBy';
import some from 'lodash/some';
import { Link } from 'nuri';
import Periods from '../Periods.json';
import Styles from '../../less/table-period.less';
import { Switch, SwitchItem } from '../ui/Switch';
import * as Layout from '../ui/Layout';
import * as Grid from '../ui/Grid';
import LoginDialog from '../ui/LoginDialog';
import SearchInput from '../ui/SearchInput';
import { App } from '../layouts';
import { RecordDTO, WorkDTO } from '../types';
import { RouteComponentProps, RouteHandler } from 'nuri/app';
import { Popover } from '../ui/Popover';
import { TableShareDialog } from '../ui/TableShareDialog';
import { TableItem } from '../ui/TableItem';
import { formatPeriod } from '../util';
import { UserDTO } from '../types_generated';

function isRecommendationEnabled(period: string): boolean {
  return period === Periods.current || period === Periods.upcoming;
}

function PageTitle(props: { period: string }) {
  const activePeriod = props.period;
  const years = [];
  for (let y = Number(Periods.current.substring(0, 4)); y >= 2014; y--) years.push(y);
  return (
    <Popover
      relativeContainer={false}
      contentClassName={Styles.nav}
      renderTrigger={({ toggle }) => (
        <a href="#" className={Styles.pageTitle} onClick={toggle}>
          {formatPeriod(activePeriod)} 신작
          <i className="fa fa-caret-down" />
        </a>
      )}
    >
      {years.map(year => (
        <div className={Styles.navRow}>
          <div className={Styles.navYear}>{year}년</div>
          {[1, 2, 3, 4].map(q => {
            const period = `${year}Q${q}`;
            const month = [1, 4, 7, 10][q - 1];
            const isValidPeriod = Periods.min <= period && period <= Periods.current;
            if (!isValidPeriod) {
              return <span className={Styles.navPeriodHidden}>{month}월</span>;
            }
            return (
              <Link
                to={`/table/${period}/`}
                className={period === activePeriod ? Styles.navPeriodActive : Styles.navPeriodNormal}
              >
                {month}월
              </Link>
            );
          })}
        </div>
      ))}
    </Popover>
  );
}

interface HeaderProps {
  excludeKR: boolean;
  showAddedOnlyFilter: boolean;
  filter: TableFilter;
  onFilterChange: (newFilter: TableFilter) => any;
  period: string;
  currentUser: any;
  totalCount: number;
  addedCount: number;
  showShareButtonPopoverOnce: boolean;
}

class ShareButton extends React.Component<{
  period: string;
  username?: string;
  showAdded: boolean;
  showPopoverOnce: boolean;
}> {
  state = {
    isOpen: false,
    hidePopover: false,
  };

  render() {
    return <div className={Styles.shareButtonContainer}>
      <a href="#share" className={Styles.shareButton} onClick={this.open}>
        <i className="fa fa-share-square-o" />
        공유
      </a>
      {this.props.showPopoverOnce && !this.state.hidePopover && (
        <span className={Styles.shareButtonPopover} onClick={this.hidePopover}>
          추가한 작품 리스트를 공유해 보세요.
        </span>
      )}
      {this.state.isOpen && (
        <TableShareDialog
          period={this.props.period}
          username={this.props.username}
          onClose={this.close}
          showAdded={this.props.showAdded}
        />
      )}
    </div>;
  }

  private open = (e: React.MouseEvent) => {
    e.preventDefault();
    this.setState({ isOpen: true, hidePopover: true });
  };

  private close = () => this.setState({ isOpen: false });

  private hidePopover = () => this.setState({ hidePopover: true });
}

function Header({ excludeKR, showAddedOnlyFilter, filter, onFilterChange, period, currentUser, totalCount, addedCount, showShareButtonPopoverOnce }: HeaderProps) {
  var options: { value: Ordering; label: string; onClick?: () => any; }[];
  if (!excludeKR) {
    options = [
      { value: 'schedule', label: '날짜 (日)' },
      { value: 'schedule.kr', label: '날짜 (韓)' },
      { value: 'recordCount', label: '인기' },
    ];
  } else {
    options = [
      { value: 'schedule', label: '날짜' },
      { value: 'recordCount', label: '인기' },
    ];
  }
  if (isRecommendationEnabled(period)) {
    options.unshift({
      value: 'recommended',
      label: '추천',
      onClick: currentUser ? undefined : () => { LoginDialog.open(); return false },
    });
  }
  return (
    <div className={Styles.header}>
      <div className={Styles.pageTitleAndShareContainer}>
        <PageTitle period={period} />
        <ShareButton
          period={period}
          username={currentUser && currentUser.name}
          showAdded={showAddedOnlyFilter}
          showPopoverOnce={showShareButtonPopoverOnce}
        />
      </div>
      <div className={Styles.settings}>
        <div className={Styles.settingsItem}>
          {'정렬: '}
          <Switch value={filter.sort} onChange={newSort => onFilterChange({ ...filter, sort: newSort })} minimal>
            {options.map(option => (
              <SwitchItem key={option.value} value={option.value} onClick={option.onClick}>
                {option.label}
              </SwitchItem>
            ))}
          </Switch>
        </div>
        {showAddedOnlyFilter && (
          <div className={Styles.settingsItem}>
            <Switch
              value={filter.addedOnly}
              onChange={(addedOnly: boolean) => onFilterChange({ ...filter, addedOnly })}
              minimal
            >
              <SwitchItem value={false}>전체 ({totalCount})</SwitchItem>
              <SwitchItem value={true}>추가한 작품 ({addedCount})</SwitchItem>
            </Switch>
          </div>
        )}
      </div>
    </div>
  );
}

const scheduleComparator = (item: WorkDTO) =>
  nullslast(item.metadata && item.metadata.schedule && item.metadata.schedule.jp && item.metadata.schedule.jp.date);

const preferKRScheduleComparator = (item: WorkDTO) =>
  nullslast(
    item.metadata && item.metadata.schedule && (
      (item.metadata.schedule.kr && item.metadata.schedule.kr.date) ||
        (item.metadata.schedule.jp && item.metadata.schedule.jp.date)
    )
  );

const recordCountComparator = (item: WorkDTO) => -item.record_count;

const recommendedComparator = (item: WorkDTO) => -(item.recommendationScore || 0);

const comparatorMap = {
  recommended: recommendedComparator,
  schedule: scheduleComparator,
  'schedule.kr': preferKRScheduleComparator,
  recordCount: recordCountComparator,
};

type Ordering = keyof typeof comparatorMap;

function nullslast(val: any) {
  return [!val, val];
}

type TableFilter = {
  sort: Ordering;
  addedOnly: boolean;
};

type TableRouteData = {
  currentUser: UserDTO;
  period: string;
  items: WorkDTO[];
  containsKRSchedule: boolean;
  hasAnyRecord: boolean;
  filter: TableFilter;
};

class Table extends React.Component<RouteComponentProps<TableRouteData>> {
  // TODO: extract stuck detect component
  private sentinelEl: Element | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  state = {
    isHeaderStuck: false,
    showShareButtonPopoverOnce: false,
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
    const { period, filter, containsKRSchedule, hasAnyRecord, items, currentUser } = this.props.data;
    let filteredItems = items;
    if (filter.addedOnly) {
      filteredItems = filteredItems.filter(it => it.record != null);
    }
    return (
      <div className={Styles.container}>
        <Layout.CenteredFullWidth>
          <div className={Styles.search}>
            <SearchInput />
          </div>
        </Layout.CenteredFullWidth>

        <div ref={el => this.sentinelEl = el} />

        <Layout.CenteredFullWidth className={this.state.isHeaderStuck ? Styles.stuckHeaderContainer : Styles.headerContainer}>
          <Header
            period={period}
            filter={filter}
            excludeKR={!containsKRSchedule}
            showAddedOnlyFilter={hasAnyRecord}
            onFilterChange={this._onFilterChange}
            currentUser={currentUser}
            totalCount={items.length}
            addedCount={items.reduce((count, it) => count + (it.record != null ? 1 : 0), 0)}
            showShareButtonPopoverOnce={this.state.showShareButtonPopoverOnce}
          />
        </Layout.CenteredFullWidth>

        {/* <Layout.CenteredFullWidth>
          {isRecommendationEnabled(period) && (
            <div className={Styles.recommendationBetaNotice}>
              <strong>✨ 신작 추천 (베타)</strong>
              기록했던 작품과 겹치는 제작진을 표시합니다.
            </div>
          )}
        </Layout.CenteredFullWidth> */}

        <Grid.Row className={Styles.items}>
          {filteredItems.map((item, i) => (
            <>
              <Grid.Column size={6} midSize={12} pull="left">
                <TableItem key={item.id} item={item} onAddRecord={this._recordAdded} />
              </Grid.Column>
              {i % 2 === 1 && <div style={{ clear: 'both' }} />}
            </>
          ))}
        </Grid.Row>
      </div>
    );
  }

  _onFilterChange = (newFilter: TableFilter) => {
    this.props.writeData((data: TableRouteData) => {
      data.filter = newFilter;
      data.items = sortBy(data.items, comparatorMap[newFilter.sort]);
    });
    this.forceUpdate(() => {
      window.scrollTo(0, 0);
    });
  };

  _recordAdded = (item: WorkDTO, record: RecordDTO) => {
    this.props.writeData((data: TableRouteData) => {
      item.record = record;
      item.record_count++;
      data.hasAnyRecord = true;
    });
    // this.setState({ showShareButtonPopoverOnce: true }); // XXX
  };
}

const routeHandler: RouteHandler<TableRouteData> = {
  component: App(Table, { activeMenu: 'search' }),

  async load({ params, loader }) {
    const { period } = params;
    const [currentUser, items] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.call(`/table/periods/${period}`, {
        with_recommendations: JSON.stringify(isRecommendationEnabled(period)),
      }),
    ]);
    const sort: Ordering = currentUser && isRecommendationEnabled(period) ? 'recommended' :
      period === Periods.current ? 'schedule' :
        'recordCount';
    return {
      currentUser,
      period,
      items: sortBy(items, comparatorMap[sort]),
      containsKRSchedule: some(
        items,
        i => i.metadata.schedule.kr && i.metadata.schedule.kr.date
      ),
      hasAnyRecord: some(
        items,
        i => i.record
      ),
      filter: {
        sort,
        addedOnly: false,
      },
    };
  },

  renderTitle({ period }) {
    return `${formatPeriod(period)} 신작`;
  },
  
  renderMeta({ period }) {
    return {
      og_url: `/table/${period}/`,
      tw_url: `/table/${period}/`,
      og_image_static: `share-table-q${period.split('Q')[1]}.jpg`,
      tw_card_type: 'summary_large_image',
      tw_image_static: `share-table-q${period.split('Q')[1]}.jpg`,
    };
  },
};
export default routeHandler;
