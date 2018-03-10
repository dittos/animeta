import React from 'react';
import sortBy from 'lodash/sortBy';
import some from 'lodash/some';
import { Link } from 'nuri';
import * as util from '../util';
import { App } from '../layouts';
import * as Layout from '../ui/Layout';
import * as Grid from '../ui/Grid';
import Periods from '../Periods.json';
import Styles from '../../less/table-period.less';
import { Switch, SwitchItem } from '../ui/Switch';
import AddRecordDialog from '../ui/AddRecordDialog';
import SearchInput from '../ui/SearchInput';
// TODO: css module

function formatPeriod(period) {
  var parts = period.split('Q');
  var year = parts[0],
    quarter = parts[1];
  return year + '년 ' + [1, 4, 7, 10][quarter - 1] + '월';
}

function offsetPeriod(period, offset) {
  // move to API server?
  var parts = period.split('Q');
  var year = parseInt(parts[0], 10);
  var quarter = parseInt(parts[1], 10);
  quarter += offset;
  if (quarter === 0) {
    year--;
    quarter = 4;
  } else if (quarter === 5) {
    year++;
    quarter = 1;
  }
  return `${year}Q${quarter}`;
}

function PageTitle(props) {
  var period = props.period;
  var prevPeriod = period !== Periods.min && offsetPeriod(props.period, -1);
  var nextPeriod = period !== Periods.current && offsetPeriod(props.period, +1);
  return (
    <div className={Styles.pageTitle}>
      {prevPeriod && (
        <Link to={`/table/${prevPeriod}/`}>
          <i className="fa fa-caret-left" />
        </Link>
      )}
      {formatPeriod(period)} 신작
      {nextPeriod && (
        <Link to={`/table/${nextPeriod}/`}>
          <i className="fa fa-caret-right" />
        </Link>
      )}
    </div>
  );
}

function Header({ excludeKR, ordering, onSort, period }) {
  var options;
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
  return (
    <Layout.LeftRight
      className={Styles.header}
      left={<PageTitle period={period} />}
      right={
        <div className={Styles.settings}>
          <div className={Styles.settingsItem}>
            <label className="hide-mobile">정렬: </label>
            <Switch value={ordering} onChange={onSort}>
              {options.map(option => (
                <SwitchItem key={option.value} value={option.value}>
                  {option.label}
                </SwitchItem>
              ))}
            </Switch>
          </div>
        </div>
      }
    />
  );
}

var WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function getDate(value) {
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

class StatusButton extends React.Component {
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
            <span className="episode">@ {util.getStatusDisplay(record)}</span>
          )}
        </Link>
      );
    } else {
      return (
        <Link
          className={Styles.favoriteButtonNormal}
          to={'/records/add/' + encodeURIComponent(this.props.item.title) + '/'}
          onClick={this._showAddModal}
        >
          <i className="fa fa-plus" />
          작품 추가
          {this.state.showAddModal && (
            <AddRecordDialog
              initialStatusType="interested"
              initialTitle={this.props.item.title}
              onCancel={() => this.setState({ showAddModal: false })}
              onCreate={this._recordAdded}
            />
          )}
        </Link>
      );
    }
  }

  _showAddModal = event => {
    event.preventDefault();
    this.setState({ showAddModal: true });
  };

  _recordAdded = result => {
    this.setState({ showAddModal: false });
    this.props.onAddRecord(this.props.item, result.record);
  };
}

function Poster({ item }) {
  return (
    <div className={Styles.poster}>
      <img src={item.image_url} className={Styles.posterImage} />
      <div className={Styles.posterOverlay}>
        <i className="fa fa-check" /> {item.record_count}
      </div>
    </div>
  );
}

function Item({ item, onAddRecord }) {
  var { links, studios, source, schedule } = item.metadata;
  return (
    <div className={Styles.item}>
      <Link to={util.getWorkURL(item.title)}>
        <Poster item={item} />
      </Link>
      <div className={Styles.itemContent}>
        <h3 className={Styles.title}>{item.metadata.title}</h3>
        <div className={Styles.info}>
          <span className="studio">
            {studios ? studios.join(', ') : '제작사 미정'}
          </span>
          {source && [
            ' / ',
            <span className="source">{util.SOURCE_TYPE_MAP[source]}</span>,
          ]}
        </div>
        <div className={Styles.actions}>
          <StatusButton item={item} onAddRecord={onAddRecord} />
        </div>
        <div className={Styles.schedules}>
          {renderSchedule('jp', schedule.jp)}
          {schedule.kr && renderSchedule('kr', schedule.kr)}
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

function renderSchedule(country, schedule) {
  var { date, date_only = false, broadcasts } = schedule;
  if (date) {
    date = new Date(date);
  }
  return (
    <div className={Styles.schedule + ' item-schedule-' + country}>
      {date ? (
        <span className="date">{getDate(date)}</span>
      ) : (
        <span className="date">미정</span>
      )}
      {date &&
        !date_only && <span className="time"> {util.formatTime(date)}</span>}
      {broadcasts && [
        ' ',
        <span className="broadcasts">({broadcasts.join(', ')})</span>,
      ]}
    </div>
  );
}

const scheduleComparator = item =>
  nullslast(item.metadata.schedule.jp && item.metadata.schedule.jp.date);

const preferKRScheduleComparator = item =>
  nullslast(
    (item.metadata.schedule.kr && item.metadata.schedule.kr.date) ||
      (item.metadata.schedule.jp && item.metadata.schedule.jp.date)
  );

const recordCountComparator = item => -item.record_count;

const comparatorMap = {
  schedule: scheduleComparator,
  'schedule.kr': preferKRScheduleComparator,
  recordCount: recordCountComparator,
};

function nullslast(val) {
  return [!val, val];
}

class Table extends React.Component {
  render() {
    const { period, ordering, containsKRSchedule, items } = this.props.data;
    return (
      <div className={Styles.container}>
        <Layout.CenteredFullWidth>
          <div className={Styles.search}>
            <SearchInput />
          </div>
          <Header
            period={period}
            ordering={ordering}
            excludeKR={!containsKRSchedule}
            onSort={this._onSort}
          />
        </Layout.CenteredFullWidth>

        <Grid.Row className={Styles.items}>
          {items.map(item => (
            <Grid.Column size={6} midSize={12} pull="left">
              <Item key={item.id} item={item} onAddRecord={this._recordAdded} />
            </Grid.Column>
          ))}
        </Grid.Row>
      </div>
    );
  }

  _onSort = sort => {
    this.props.writeData(data => {
      data.ordering = sort;
      data.items = sortBy(data.items, comparatorMap[sort]);
    });
  };

  _recordAdded = (item, record) => {
    this.props.writeData(() => {
      item.record = record;
      item.record_count++;
    });
  };
}

export default {
  component: App(Table, { activeMenu: 'search' }),

  async load({ params, loader }) {
    const { period } = params;
    const [currentUser, items] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.call(`/table/periods/${period}`, {
        only_first_period: JSON.stringify(true),
      }),
    ]);
    return {
      currentUser,
      period,
      items: sortBy(items, scheduleComparator),
      containsKRSchedule: some(
        items,
        i => i.metadata.schedule.kr && i.metadata.schedule.kr.date
      ),
      ordering: 'schedule',
    };
  },

  renderTitle({ period }) {
    return `${formatPeriod(period)} 신작`;
  },
};
