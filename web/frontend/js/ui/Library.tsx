import orderBy from 'lodash/orderBy';
import React from 'react';
import formatDate from 'date-fns/format';
import diffDays from 'date-fns/difference_in_calendar_days';
import diffWeeks from 'date-fns/difference_in_calendar_weeks';
import diffMonths from 'date-fns/difference_in_calendar_months';
import { Link } from 'nuri';
import * as util from '../util';
import Styles from './Library.module.less';
import * as Grid from './Grid';
import { Switch, SwitchItem } from './Switch';
import AddRecordDialog from './AddRecordDialog';
import { trackEvent } from '../Tracking';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp, faPlus, faStar } from '@fortawesome/free-solid-svg-icons';
import { Library_CreateRecordDocument, Library_RecordFragment, Library_UserFragment } from './__generated__/Library.graphql';
import { LibraryFilter } from './LibraryFilter';
import { NormalizedUserRouteQuery, serializeUserRouteQuery } from '../UserRouteUtils';
import { RecordOrder, StatusType } from '../__generated__/globalTypes';

const ENABLE_NEW_ADD_RECORD = false;

function getDateHeader(record: Library_RecordFragment): string {
  const now = new Date();
  if (!record.updatedAt) {
    return '?';
  }
  var days = diffDays(now, record.updatedAt);
  if (days <= 60) {
    if (days < 1) return '오늘';
    else if (days < 2) return '어제';
    else if (days < 3) return '그저께';
    else if (days < 4) return '그끄저께';
    else if (diffWeeks(now, record.updatedAt) === 0) return '이번 주';
    else if (diffWeeks(now, record.updatedAt) === 1) return '지난 주';
    else if (diffMonths(now, record.updatedAt) === 0) return '이번 달';
    else if (diffMonths(now, record.updatedAt) === 1) return '지난 달';
  }
  return formatDate(record.updatedAt, 'YYYY/MM');
}

function getIndexChar(s: string): string {
  if (!s) return '#';

  s = s.replace(/^the /i, '');

  var ch = s.charAt(0);
  if ('가' <= ch && ch <= '힣') {
    // 쌍자음 처리
    var code = ch.charCodeAt(0);
    var lead = Math.floor((code - 0xac00) / 588);
    if (lead == 1 || lead == 4 || lead == 8 || lead == 10 || lead == 13) lead--;
    return String.fromCharCode(0xac00 + lead * 588);
  } else if (('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z')) {
    return ch.toUpperCase();
  } else {
    return '#';
  }
}

type RecordGroup = { key: string, items: Library_RecordFragment[], index?: number };

function groupRecords(records: Library_RecordFragment[], keyFn: (record: Library_RecordFragment) => string | null): RecordGroup[] {
  var groups: RecordGroup[] = [];
  var unknownGroup: Library_RecordFragment[] = [];
  var lastKey: string | null = null;
  var group: Library_RecordFragment[] = [];
  records.forEach(record => {
    const key = keyFn(record);
    if (key == null) {
      unknownGroup.push(record);
    } else {
      if (key != lastKey) {
        if (group.length > 0 && lastKey) groups.push({ key: lastKey, items: group });
        lastKey = key;
        group = [];
      }
      group.push(record);
    }
  });
  if (group.length > 0 && lastKey) groups.push({ key: lastKey, items: group });
  if (unknownGroup.length) groups.push({ key: '?', items: unknownGroup });
  for (var i = 0; i < groups.length; i++) groups[i].index = 1 + i;
  return groups;
}

function groupRecordsByTitle(records: Library_RecordFragment[]): RecordGroup[] {
  records = orderBy(records, record => getIndexChar(record.title!));
  return groupRecords(records, record => getIndexChar(record.title!));
}

function groupRecordsByDate(records: Library_RecordFragment[]): RecordGroup[] {
  records = orderBy(records, record => record.updatedAt || '', 'desc');
  return groupRecords(records, record => record.updatedAt ? getDateHeader(record) : null);
}

function groupRecordsByRating(records: Library_RecordFragment[]): RecordGroup[] {
  records = orderBy(records, record => record.rating || 0, 'desc');
  return groupRecords(records, record => record.rating ? `${record.rating}점` : '별점 없음');
}

function LibraryItem({ record }: { record: Library_RecordFragment }) {
  return (
    <div className={`${Styles.groupItem} item-${record.statusType?.toLowerCase()}`}>
      <Link to={`/records/${record.databaseId}/`}>
        <span className="item-title">{record.title}</span>
        <span className="item-status">{util.getStatusTextGql(record)}</span>
        {record.hasNewerEpisode && <span className="item-updated">up!</span>}
      </Link>
    </div>
  );
}

type LibraryProps = {
  query: NormalizedUserRouteQuery;
  onAddRecord(): any;
  user: Library_UserFragment;
};

class Library extends React.Component<LibraryProps> {
  state = {
    mobileFilterVisible: false,
    showAddModal: false,
  };

  render() {
    const { orderBy } = this.props.query;
    const records = this.props.user.records.nodes;
    var groups: RecordGroup[] = [];
    if (orderBy === RecordOrder.Date) {
      groups = groupRecordsByDate(records);
    } else if (orderBy === RecordOrder.Title) {
      groups = groupRecordsByTitle(records);
    } else if (orderBy === RecordOrder.Rating) {
      groups = groupRecordsByRating(records);
    }
    const filters = this.props.user.recordFilters;
    const { totalCount, filteredCount } = filters;
    const canEdit = this.props.user.isCurrentUser;
    return (
      <Grid.Row className={Styles.library}>
        <Grid.Column size={3} pull="left">
          {canEdit && (
            <div className={Styles.navButtonGroup}>
              <Link
                to={ENABLE_NEW_ADD_RECORD ? "/records/add-new/" : "/records/add/"}
                className={Styles.addRecordButton}
                onClick={this._showAddModal}
              >
                <FontAwesomeIcon icon={faPlus} /> 작품 추가
              </Link>
              {this.state.showAddModal && (
                /* TODO: automatically set selected filter state */
                <AddRecordDialog
                  initialStatusType={StatusType.Finished}
                  onCancel={() => this.setState({ showAddModal: false })}
                  onCreate={this._recordCreated}
                  createRecordMutation={Library_CreateRecordDocument}
                />
              )}
              <Link
                to={"/records/rating/"}
                className={Styles.manageRatingButton}
              >
                <FontAwesomeIcon icon={faStar} /> 별점 관리
              </Link>
            </div>
          )}
          <div
            className={Styles.mobileFilterToggle}
            onClick={this._toggleMobileFilter}
          >
            {totalCount !== filteredCount ? '필터 (사용중)' : '필터'}{' '}
            <FontAwesomeIcon
              icon={
                this.state.mobileFilterVisible
                  ? faCaretUp
                  : faCaretDown
              }
            />
          </div>
          <div className={Styles.sort}>
            <Switch>
              <SwitchItem
                Component={Link}
                {...this._getLinkParams({ orderBy: RecordOrder.Date })}
                active={orderBy === RecordOrder.Date}
              >
                시간순
              </SwitchItem>
              <SwitchItem
                Component={Link}
                {...this._getLinkParams({ orderBy: RecordOrder.Title })}
                active={orderBy === RecordOrder.Title}
              >
                제목순
              </SwitchItem>
              <SwitchItem
                Component={Link}
                {...this._getLinkParams({ orderBy: RecordOrder.Rating })}
                active={orderBy === RecordOrder.Rating}
              >
                별점순
              </SwitchItem>
            </Switch>
            {(orderBy === RecordOrder.Title || orderBy === RecordOrder.Rating) && (
              <div className={Styles.toc}>
                {groups.map(group => (
                  <a
                    href={'#group' + group.index}
                    key={group.key}
                    onClick={this._scrollToGroup}
                  >
                    {group.key}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className={this.state.mobileFilterVisible ? '' : 'hide-mobile'}>
            <LibraryFilter
              query={this.props.query}
              filters={filters}
              categoryList={this.props.user.categories}
              canEdit={canEdit}
              getLinkParams={this._getLinkParams}
            />
          </div>
        </Grid.Column>
        <Grid.Column size={9} pull="left">
          {totalCount === 0 ? (
            <div className={Styles.empty}>
              <h1>아직 기록이 하나도 없네요.</h1>
              {canEdit && (
                <p>
                  <Link to={ENABLE_NEW_ADD_RECORD ? "/records/add-new/" : "/records/add/"} onClick={this._showAddModal}>
                    작품 추가
                  </Link>를 눌러 감상 기록을 등록할 수 있습니다.
                </p>
              )}
            </div>
          ) : (
            <>
              {/*this.props.canEdit && (
                <div className={Styles.notice}>
                  <h3>🤩 별점 기능 추가</h3>
                  <p>
                    개별 작품 기록에서 별점을 입력하거나,{' '}<br className="show-mobile" />
                    <Link to="/records/rating/">별점 관리</Link> 메뉴에서 한번에 별점을 매겨보세요.
                  </p>
                </div>
              )*/}
              {groups.map(group => (
                <div
                  className={Styles.group}
                  key={group.key}
                  id={'group' + group.index}
                >
                  <h2 className={Styles.groupTitle}>{group.key}</h2>
                  <div className={Styles.groupItems}>
                    {group.items.map(record => (
                      <LibraryItem key={record.databaseId} record={record} />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </Grid.Column>
      </Grid.Row>
    );
  }

  _getLinkParams = (updates: Partial<NormalizedUserRouteQuery>) => {
    const basePath = `/users/${encodeURIComponent(this.props.user.name!)}/`;
    return {
      to: basePath,
      queryParams: serializeUserRouteQuery({ ...this.props.query, ...updates }),
    };
  };

  _scrollToGroup = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const id = (event.target as HTMLAnchorElement).hash.substring(1);
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollBy(0, el.getBoundingClientRect().top - 50);
  };

  _toggleMobileFilter = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState({ mobileFilterVisible: !this.state.mobileFilterVisible });
  };

  _showAddModal = (event: React.MouseEvent) => {
    if (ENABLE_NEW_ADD_RECORD) return;
    event.preventDefault();
    this.setState({ showAddModal: true });
  };

  _recordCreated = () => {
    this.props.onAddRecord();
    trackEvent({
      eventCategory: 'Record',
      eventAction: 'Create',
      eventLabel: 'Library',
    });
    this.setState({ showAddModal: false });
  };
}

export default Library;
