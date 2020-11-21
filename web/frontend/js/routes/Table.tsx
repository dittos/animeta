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
import AddRecordDialog from '../ui/AddRecordDialog';
import SearchInput from '../ui/SearchInput';
import { App } from '../layouts';
import { trackEvent } from '../Tracking';
import * as util from '../util';
import { CreditType, RecordDTO, WorkDTO, WorkSchedule } from '../types';
import { RouteComponentProps, RouteHandler } from 'nuri/app';
import { Popover } from '../ui/Popover';

function isRecommendationEnabled(period: string): boolean {
  return period === Periods.current || period === Periods.upcoming;
}

function formatPeriod(period: string): string {
  var parts = period.split('Q');
  var year = parts[0],
    quarter = Number(parts[1]);
  return year + '년 ' + [1, 4, 7, 10][quarter - 1] + '월';
}

function PageTitle(props: { period: string }) {
  const activePeriod = props.period;
  const years = [];
  for (let y = Number(Periods.current.substring(0, 4)); y >= 2014; y--) years.push(y);
  return (
    <Popover
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
}

function Header({ excludeKR, showAddedOnlyFilter, filter, onFilterChange, period, currentUser, totalCount, addedCount }: HeaderProps) {
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
      <div className={Styles.pageTitleContainer}>
        <PageTitle period={period} />
      </div>
      <div className={Styles.settings}>
        <div className={Styles.settingsItem}>
          {'정렬: '}
          <Switch value={filter.sort} onChange={(newSort: Ordering) => onFilterChange({ ...filter, sort: newSort })}>
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
            >
              <SwitchItem value={false}>전체 보기 ({totalCount})</SwitchItem>
              <SwitchItem value={true}>추가한 작품만 보기 ({addedCount})</SwitchItem>
            </Switch>
          </div>
        )}
      </div>
    </div>
  );
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getDate(value: Date): string {
  var weekday = WEEKDAYS[value.getDay()];
  return (
    util.zerofill(value.getMonth() + 1) +
    '/' +
    util.zerofill(value.getDate()) +
    ' (' +
    weekday +
    ')'
  );
}

interface StatusButtonProps {
  item: WorkDTO;
  onAddRecord: (item: WorkDTO, record: RecordDTO) => any;
}

class StatusButton extends React.Component<StatusButtonProps> {
  state = {
    showAddModal: false,
  };

  render() {
    var { record } = this.props.item;
    if (record) {
      return (
        <Link
          className={Styles.favoriteButtonActive}
          to={`/records/${record.id}/`}
        >
          <i className="fa fa-pencil" />
          {util.STATUS_TYPE_TEXT[record.status_type]}
          {record.status && (
            <span className={Styles.favoriteButtonSubtext}>@ {util.getStatusDisplay(record)}</span>
          )}
        </Link>
      );
    } else {
      return (<>
        <Link
          className={Styles.favoriteButtonNormal}
          to={'/records/add/' + encodeURIComponent(this.props.item.title) + '/'}
          onClick={this._showAddModal}
        >
          <i className="fa fa-plus" />
          작품 추가
        </Link>
        {this.state.showAddModal && (
          <AddRecordDialog
            initialStatusType="interested"
            initialTitle={this.props.item.title}
            onCancel={this._closeAddModal}
            onCreate={this._recordAdded}
          />
        )}
      </>);
    }
  }

  _showAddModal = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState({ showAddModal: true });
  };

  _closeAddModal = () => {
    this.setState({ showAddModal: false });
  };

  _recordAdded = (result: { record: RecordDTO }) => {
    this.setState({ showAddModal: false });
    trackEvent({
      eventCategory: 'Record',
      eventAction: 'Create',
      eventLabel: 'Table',
    });
    this.props.onAddRecord(this.props.item, result.record);
  };
}

function Poster({ item }: { item: WorkDTO }) {
  return (
    <div className={Styles.poster}>
      <img src={item.image_url} className={Styles.posterImage} />
      <div className={Styles.posterOverlay}>
        <i className="fa fa-check" /> {item.record_count}
      </div>
    </div>
  );
}

const creditTypeText: {[K in CreditType]: string} = {
  'ORIGINAL_WORK': '원작',
  'CHIEF_DIRECTOR': '총감독',
  'SERIES_DIRECTOR': '시리즈 감독',
  'DIRECTOR': '감독',
  'SERIES_COMPOSITION': '시리즈 구성',
  'CHARACTER_DESIGN': '캐릭터 디자인',
  'MUSIC': '음악',
};

function Item({ item, onAddRecord }: { item: WorkDTO; onAddRecord: (item: WorkDTO, record: RecordDTO) => any }) {
  var { links, studios, source, schedule, durationMinutes } = item.metadata;
  return (
    <div className={Styles.item}>
      <Link to={util.getWorkURL(item.title)}>
        <Poster item={item} />
      </Link>
      <div className={Styles.itemContent}>
        <h3 className={Styles.title}>
          {item.metadata.title}
          {durationMinutes && <span className={Styles.duration}>{durationMinutes}분</span>}
        </h3>
        <div className={Styles.info}>
          <span className="studio">
            {studios ? studios.join(', ') : '제작사 미정'}
          </span>
          {source && <>
            {' / '}
            <span className="source">{util.SOURCE_TYPE_MAP[source]}</span>
          </>}
        </div>
        <div className={Styles.actions}>
          <StatusButton item={item} onAddRecord={onAddRecord} />
        </div>
        <div className={Styles.schedules}>
          {renderSchedule('jp', schedule.jp)}
          {schedule.kr && renderSchedule('kr', schedule.kr)}
        </div>
        <div className={Styles.credits}>
          {item.recommendations && item.recommendations.length > 0 && (
            item.recommendations.map(({ credit, related }) => (
              <div className={Styles.credit}>
                <span className={Styles.creditType}>{creditTypeText[credit.type]}</span>
                {credit.name}{' '}
                <span className={Styles.creditRelated}>({related.map(it => it.workTitle).join(', ')})</span>
              </div>
            ))
          )}
        </div>
        <div className={Styles.links}>
          {links.website && (
            <a
              href={links.website}
              className="link link-official"
              target="_blank"
            >
              공식 사이트
            </a>
          )}
          {links.namu && (
            <a href={links.namu} className="link link-namu" target="_blank">
              나무위키
            </a>
          )}
          {links.ann && (
            <a href={links.ann} className="link link-ann" target="_blank">
              ANN (en)
            </a>
          )}
        </div>
      </div>
      <div style={{ clear: 'left' }} />
    </div>
  );
}

function renderSchedule(country: string, schedule: WorkSchedule) {
  var { date, date_only = false, broadcasts } = schedule;
  const dateObject = date ? new Date(date) : null;
  return (
    <div className={Styles.schedule + ' item-schedule-' + country}>
      {dateObject ? (
        <span className="date">{getDate(dateObject)}</span>
      ) : (
        <span className="date">미정</span>
      )}
      {date &&
        !date_only && <span className="time"> {util.formatTime(dateObject)}</span>}
      {broadcasts && [
        ' ',
        <span className="broadcasts">({broadcasts.join(', ')})</span>,
      ]}
    </div>
  );
}

const scheduleComparator = (item: WorkDTO) =>
  nullslast(item.metadata.schedule.jp && item.metadata.schedule.jp.date);

const preferKRScheduleComparator = (item: WorkDTO) =>
  nullslast(
    (item.metadata.schedule.kr && item.metadata.schedule.kr.date) ||
      (item.metadata.schedule.jp && item.metadata.schedule.jp.date)
  );

const recordCountComparator = (item: WorkDTO) => -item.record_count;

const recommendedComparator = (item: WorkDTO) => -item.recommendationScore;

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
  currentUser: any;
  period: string;
  items: WorkDTO[];
  containsKRSchedule: boolean;
  hasAnyRecord: boolean;
  filter: TableFilter;
};

class Table extends React.Component<RouteComponentProps<TableRouteData>> {
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

        <Layout.CenteredFullWidth className={Styles.headerContainer}>
          <Header
            period={period}
            filter={filter}
            excludeKR={!containsKRSchedule}
            showAddedOnlyFilter={hasAnyRecord}
            onFilterChange={this._onFilterChange}
            currentUser={currentUser}
            totalCount={items.length}
            addedCount={items.reduce((count, it) => count + (it.record != null ? 1 : 0), 0)}
          />
        </Layout.CenteredFullWidth>

        <Layout.CenteredFullWidth>
          {isRecommendationEnabled(period) && (
            <div className={Styles.recommendationBetaNotice}>
              <strong>✨ 신작 추천 (베타)</strong>
              기록했던 작품과 겹치는 제작진을 표시합니다.
            </div>
          )}
        </Layout.CenteredFullWidth>

        <Grid.Row className={Styles.items}>
          {filteredItems.map((item, i) => (
            <>
              <Grid.Column size={6} midSize={12} pull="left">
                <Item key={item.id} item={item} onAddRecord={this._recordAdded} />
              </Grid.Column>
              {i % 2 === 1 && <div style={{ clear: 'both' }} />}
            </>
          ))}
        </Grid.Row>
      </div>
    );
  }

  _onFilterChange = (newFilter: TableFilter) => {
    this.props.writeData((data: any) => {
      data.filter = newFilter;
      data.items = sortBy(data.items, comparatorMap[newFilter.sort]);
    });
  };

  _recordAdded = (item: WorkDTO, record: RecordDTO) => {
    this.props.writeData(() => {
      item.record = record;
      item.record_count++;
    });
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
        only_first_period: JSON.stringify(true),
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
};
export default routeHandler;
