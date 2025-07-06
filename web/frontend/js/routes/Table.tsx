import React, { useEffect, useRef, useState } from 'react';
import sortBy from 'lodash/sortBy';
import some from 'lodash/some';
import { Link } from 'nuri';
import Styles from './Table.module.less';
import { Switch, SwitchItem } from '../ui/Switch';
import * as Layout from '../ui/Layout';
import * as Grid from '../ui/Grid';
import LoginDialog from '../ui/LoginDialog';
import SearchInput from '../ui/SearchInput';
import { AppLayout } from '../layouts/AppLayout';
import { RouteComponentProps } from '../routes';
import { Popover } from '../ui/Popover';
import { TableShareDialog } from '../ui/TableShareDialog';
import { TableItem } from '../ui/TableItem';
import { formatPeriod } from '../util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faShareSquare } from '@fortawesome/free-solid-svg-icons';
import { TableRouteDocument, TableRouteQuery, TableRoute_PageTitleFragment } from './__generated__/Table.graphql';
import useIntersectionObserver from '../ui/useIntersectionObserver'
import groupBy from 'lodash/groupBy';
import { TableItem_Item_RecordFragment } from '../ui/__generated__/TableItem.graphql';

function PageTitle(props: { period: TableRoute_PageTitleFragment, tablePeriods: TableRouteQuery['tablePeriods'] }) {
  const activePeriod = props.period;
  const periodsByYear = Object.entries(groupBy(props.tablePeriods, 'year'))
  periodsByYear.sort(([a, ], [b, ]) => Number(b) - Number(a))
  periodsByYear.forEach(([, periods]) => periods.sort((a, b) => a.month - b.month))
  return (
    <Popover
      relativeContainer={false}
      contentClassName={Styles.nav}
      renderTrigger={({ toggle }) => (
        <a href="#" className={Styles.pageTitle} onClick={toggle}>
          {formatPeriod(activePeriod)} 신작
          <FontAwesomeIcon icon={faCaretDown} size="sm" />
        </a>
      )}
    >
      {periodsByYear.map(([year, periods]) => {
        // fillers for mobile view
        const fillers = []
        for (let i = 0; i < 4 - periods.length; i++) {
          fillers.push(<span className={Styles.navPeriodHidden} />)
        }
        return (
          <div className={Styles.navRow}>
            <div className={Styles.navYear}>{year}년</div>
            {periods.map(({ period, month }) => (
              <Link
                to={`/table/${period}/`}
                className={period === activePeriod.period ? Styles.navPeriodActive : Styles.navPeriodNormal}
              >
                {month}월
              </Link>
            ))}
            {fillers}
          </div>
        )
      })}
    </Popover>
  );
}

interface HeaderProps {
  excludeKR: boolean;
  showAddedOnlyFilter: boolean;
  filter: TableFilter;
  onFilterChange: (newFilter: TableFilter) => any;
  period: NonNullable<TableRouteQuery['tablePeriod']>;
  tablePeriods: TableRouteQuery['tablePeriods'];
  currentUser: any;
  totalCount: number;
  addedCount: number;
  showShareButtonPopoverOnce: boolean;
}

class ShareButton extends React.Component<{
  period: {
    period: string;
    year: number;
    month: number;
  };
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
        <FontAwesomeIcon icon={faShareSquare} />
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

function Header({ excludeKR, showAddedOnlyFilter, filter, onFilterChange, period, tablePeriods, currentUser, totalCount, addedCount, showShareButtonPopoverOnce }: HeaderProps) {
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
  if (period.isRecommendationEnabled) {
    options.unshift({
      value: 'recommended',
      label: '추천',
      onClick: currentUser ? undefined : () => { LoginDialog.open(); return false },
    });
  }
  return (
    <div className={Styles.header}>
      <div className={Styles.pageTitleAndShareContainer}>
        <PageTitle period={period} tablePeriods={tablePeriods} />
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

const scheduleComparator = (item: TablePeriodItem) =>
  nullslast(item.work.metadata?.schedules?.find(it => it.country === 'jp')?.date);

const preferKRScheduleComparator = (item: TablePeriodItem) =>
  nullslast(
    item.work.metadata?.schedules?.find(it => it.country === 'kr')?.date ||
      item.work.metadata?.schedules?.find(it => it.country === 'jp')?.date
  );

const recordCountComparator = (item: TablePeriodItem) => -(item.work.recordCount ?? 0);

const recommendedComparator = (item: TablePeriodItem) => -(item.recommendationScore || 0);

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

type TablePeriodItem = NonNullable<TableRouteQuery['tablePeriod']>['items'][number]

type TableRouteData = TableRouteQuery & {
  tablePeriod: NonNullable<TableRouteQuery['tablePeriod']>;
  items: TablePeriodItem[];
  containsKRSchedule: boolean;
  hasAnyRecord: boolean;
  filter: TableFilter;
};

const Table: React.FC<RouteComponentProps<TableRouteData>> = ({
  data,
  writeData,
}) => {
  const sentinelEl = useRef<HTMLDivElement | null>(null)
  const entry = useIntersectionObserver(sentinelEl, {
    threshold: [0],
    rootMargin: '-48px 0px 0px 0px',
  })
  const isHeaderStuck = entry ? !entry.isIntersecting : false

  const [showShareButtonPopoverOnce, setShowShareButtonPopoverOnce] = useState(false)

  // scroll to top when filter changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [data.filter])

  const { filter, containsKRSchedule, hasAnyRecord, items, currentUser, tablePeriod } = data
  let filteredItems = items
  if (filter.addedOnly) {
    filteredItems = filteredItems.filter(it => it.record != null)
  }
  
  const onFilterChange = (newFilter: TableFilter) => {
    writeData((data: TableRouteData) => {
      data.filter = newFilter
      data.items = sortBy(data.items, comparatorMap[newFilter.sort])
    })
  }

  const recordAdded = (item: TablePeriodItem, record: TableItem_Item_RecordFragment) => {
    writeData((data: TableRouteData) => {
      item.record = record
      item.work.recordCount = (item.work.recordCount ?? 0) + 1
      data.hasAnyRecord = true
    })
    // setShowShareButtonPopoverOnce(true) // XXX
  };

  return (
    <div className={Styles.container}>
      <Layout.CenteredFullWidth>
        <div className={Styles.search}>
          <SearchInput />
        </div>
      </Layout.CenteredFullWidth>

      <div ref={sentinelEl} />

      <Layout.CenteredFullWidth className={isHeaderStuck ? Styles.stuckHeaderContainer : Styles.headerContainer}>
        <Header
          period={tablePeriod}
          tablePeriods={data.tablePeriods}
          filter={filter}
          excludeKR={!containsKRSchedule}
          showAddedOnlyFilter={hasAnyRecord}
          onFilterChange={onFilterChange}
          currentUser={currentUser}
          totalCount={items.length}
          addedCount={items.reduce((count, it) => count + (it.record != null ? 1 : 0), 0)}
          showShareButtonPopoverOnce={showShareButtonPopoverOnce}
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
              <TableItem key={item.work.databaseId} item={item} onAddRecord={recordAdded} />
            </Grid.Column>
            {i % 2 === 1 && <div style={{ clear: 'both' }} />}
          </>
        ))}
      </Grid.Row>
    </div>
  )
}

const routeHandler = AppLayout({ activeMenu: 'search' }).wrap({
  component: Table,

  async load({ params, loader }) {
    const { period } = params
    const data = await loader.graphql(TableRouteDocument, {period, withRecommendations: true})
    const {tablePeriod} = data
    if (!tablePeriod) throw new Error('not found')
    const sort: Ordering = data.currentUser && tablePeriod.isRecommendationEnabled ? 'recommended' :
      period === tablePeriod.isCurrent ? 'schedule' :
        'recordCount';
    const items = tablePeriod.items;
    return {
      ...data,
      tablePeriod,
      items: sortBy(items, comparatorMap[sort]),
      containsKRSchedule: some(
        items,
        i => i.work.metadata?.schedules?.find(it => it.country === 'kr')?.date
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

  renderTitle({ tablePeriod }) {
    return `${formatPeriod(tablePeriod)} 신작`;
  },
  
  renderMeta({ tablePeriod }) {
    const period = tablePeriod.period
    return {
      og_url: `/table/${period}/`,
      tw_url: `/table/${period}/`,
      og_image_static: `share-table-q${period.split('Q')[1]}.jpg`,
      tw_card_type: 'summary_large_image',
      tw_image_static: `share-table-q${period.split('Q')[1]}.jpg`,
    };
  },
});
export default routeHandler;
