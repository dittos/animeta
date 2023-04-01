import sortBy from 'lodash/sortBy';
import React from 'react';
import formatDate from 'date-fns/format';
import diffDays from 'date-fns/difference_in_calendar_days';
import diffWeeks from 'date-fns/difference_in_calendar_weeks';
import diffMonths from 'date-fns/difference_in_calendar_months';
import { Link } from 'nuri';
import * as util from '../util';
import Styles from './Library.less';
import * as Grid from './Grid';
import { Switch, SwitchItem } from './Switch';
import AddRecordDialog from './AddRecordDialog';
import { trackEvent } from '../Tracking';
import { CategoryDTO, RecordDTO, LegacyStatusType, UserDTO } from '../../../shared/types';
import { LinkProps } from 'nuri/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp, faCog, faPlus, faStar } from '@fortawesome/free-solid-svg-icons';
import { Library_CreateRecordDocument } from './__generated__/Library.graphql';

const ENABLE_NEW_ADD_RECORD = false;

function getDateHeader(record: RecordDTO): string {
  const now = new Date();
  if (!record.updated_at) {
    return '?';
  }
  var days = diffDays(now, record.updated_at);
  if (days <= 60) {
    if (days < 1) return '오늘';
    else if (days < 2) return '어제';
    else if (days < 3) return '그저께';
    else if (days < 4) return '그끄저께';
    else if (diffWeeks(now, record.updated_at) === 0) return '이번 주';
    else if (diffWeeks(now, record.updated_at) === 1) return '지난 주';
    else if (diffMonths(now, record.updated_at) === 0) return '이번 달';
    else if (diffMonths(now, record.updated_at) === 1) return '지난 달';
  }
  return formatDate(record.updated_at, 'YYYY/MM');
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

type RecordGroup = { key: string, items: RecordDTO[], index?: number };

function groupRecords(records: RecordDTO[], keyFn: (record: RecordDTO) => string | null): RecordGroup[] {
  var groups: RecordGroup[] = [];
  var unknownGroup: RecordDTO[] = [];
  var lastKey: string | null = null;
  var group: RecordDTO[] = [];
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

function groupRecordsByTitle(records: RecordDTO[]): RecordGroup[] {
  records = sortBy(records, record => getIndexChar(record.title));
  return groupRecords(records, record => getIndexChar(record.title));
}

function groupRecordsByDate(records: RecordDTO[]): RecordGroup[] {
  records = sortBy(records, record => -(record.updated_at || 0));
  return groupRecords(records, record => record.updated_at ? getDateHeader(record) : null);
}

function groupRecordsByRating(records: RecordDTO[]): RecordGroup[] {
  records = sortBy(records, record => -(record.rating || 0));
  return groupRecords(records, record => record.rating ? `${record.rating}점` : '별점 없음');
}

function LibraryItem({ record }: { record: RecordDTO }) {
  return (
    <div className={`${Styles.groupItem} item-${record.status_type}`}>
      <Link to={`/records/${record.id}/`}>
        <span className="item-title">{record.title}</span>
        <span className="item-status">{util.getStatusText(record)}</span>
        {record.has_newer_episode && <span className="item-updated">up!</span>}
      </Link>
    </div>
  );
}

type LibraryFilterProps = {
  count: number;
  filteredCount: number;
  sortBy: string;
  groups: RecordGroup[];
  scrollToGroup(event: React.MouseEvent<HTMLAnchorElement>): any;
  statusTypeFilter: string;
  categoryFilter: string;
  getLinkParams(params: Partial<LibraryRouteQuery>): LinkProps;
  statusTypeStats: {[key: string]: number} & {_all: number};
  categoryStats: {[key: string]: number} & {_all: number};
  categoryList: CategoryDTO[];
  canEdit: boolean;
};

class LibraryFilter extends React.Component<LibraryFilterProps> {
  render() {
    return (
      <div className={Styles.filter}>
        <div className={Styles.filterGroup}>
          <div className={Styles.filterGroupTitle}>상태</div>
          <div
            className={
              this.props.statusTypeFilter === ''
                ? Styles.filterGroupItemActive
                : Styles.filterGroupItem
            }
          >
            <Link {...this.props.getLinkParams({ type: '' })}>
              전체 ({this.props.statusTypeStats._all})
            </Link>
          </div>
          {['watching', 'finished', 'suspended', 'interested'].map(
            (statusType: LegacyStatusType) => (
              <div
                className={
                  this.props.statusTypeFilter === statusType
                    ? Styles.filterGroupItemActive
                    : Styles.filterGroupItem
                }
              >
                <Link
                  {...this.props.getLinkParams({
                    type: statusType,
                  })}
                >
                  {util.STATUS_TYPE_TEXT[statusType]} ({this.props
                    .statusTypeStats[statusType] || 0})
                </Link>
              </div>
            )
          )}
        </div>
        <div className={Styles.filterGroup}>
          <div className={Styles.filterGroupTitle}>분류</div>
          <div
            className={
              this.props.categoryFilter === ''
                ? Styles.filterGroupItemActive
                : Styles.filterGroupItem
            }
          >
            <Link {...this.props.getLinkParams({ category: '' })}>
              전체 ({this.props.categoryStats._all})
            </Link>
          </div>
          {[{ id: 0, name: '지정 안함' }]
            .concat(this.props.categoryList)
            .map(category => (
              <div
                className={
                  this.props.categoryFilter === String(category.id)
                    ? Styles.filterGroupItemActive
                    : Styles.filterGroupItem
                }
              >
                <Link
                  {...this.props.getLinkParams({
                    category: String(category.id),
                  })}
                >
                  {category.name} ({this.props.categoryStats[category.id] || 0})
                </Link>
              </div>
            ))}{' '}
          {this.props.canEdit && (
            <Link
              to="/records/category/"
              className={Styles.manageCategoryButton}
            >
              <FontAwesomeIcon icon={faCog} /> 분류 관리
            </Link>
          )}
        </div>
      </div>
    );
  }
}

export type LibraryRouteQuery = {
  type?: string;
  category?: string;
  sort?: string;
};

type LibraryProps = {
  user: UserDTO;
  count: number;
  query: LibraryRouteQuery;
  records: RecordDTO[];
  filteredCount: number;
  categoryStats: {[key: string]: number} & {_all: number};
  categoryList: CategoryDTO[];
  statusTypeStats: {[key: string]: number} & {_all: number};
  canEdit: boolean;
  onAddRecord(): any;
};

class Library extends React.Component<LibraryProps> {
  state = {
    mobileFilterVisible: false,
    showAddModal: false,
  };

  render() {
    var { type = '', category = '', sort } = this.props.query;
    if (!sort) sort = 'date';
    var {
      count,
      filteredCount,
      records,
      categoryStats,
      statusTypeStats,
      categoryList,
    } = this.props;
    var groups: RecordGroup[] = [];
    if (sort === 'date') {
      groups = groupRecordsByDate(records);
    } else if (sort === 'title') {
      groups = groupRecordsByTitle(records);
    } else if (sort === 'rating') {
      groups = groupRecordsByRating(records);
    }
    return (
      <Grid.Row className={Styles.library}>
        <Grid.Column size={3} pull="left">
          {this.props.canEdit && (
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
                  initialStatusType="FINISHED"
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
            {count !== filteredCount ? '필터 (사용중)' : '필터'}{' '}
            <FontAwesomeIcon
              icon={
                this.state.mobileFilterVisible
                  ? faCaretUp
                  : faCaretDown
              }
            />
          </div>
          <div className={Styles.filterGroup}>
            <Switch>
              <SwitchItem
                Component={Link}
                {...this._getLinkParams({ sort: 'date' })}
                active={sort === 'date'}
              >
                시간순
              </SwitchItem>
              <SwitchItem
                Component={Link}
                {...this._getLinkParams({ sort: 'title' })}
                active={sort === 'title'}
              >
                제목순
              </SwitchItem>
              <SwitchItem
                Component={Link}
                {...this._getLinkParams({ sort: 'rating' })}
                active={sort === 'rating'}
              >
                별점순
              </SwitchItem>
            </Switch>
            {(sort === 'title' || sort === 'rating') && (
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
              count={count}
              filteredCount={filteredCount}
              sortBy={sort}
              groups={groups}
              scrollToGroup={this._scrollToGroup}
              statusTypeFilter={type}
              statusTypeStats={statusTypeStats}
              categoryFilter={category}
              categoryList={categoryList}
              categoryStats={categoryStats}
              canEdit={this.props.canEdit}
              getLinkParams={this._getLinkParams}
            />
          </div>
        </Grid.Column>
        <Grid.Column size={9} pull="left">
          {this.props.count === 0 ? (
            <div className={Styles.empty}>
              <h1>아직 기록이 하나도 없네요.</h1>
              {this.props.canEdit && (
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
                      <LibraryItem key={record.id} record={record} />
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

  _getLinkParams = (updates: Partial<LibraryRouteQuery>) => {
    const basePath = `/users/${encodeURIComponent(this.props.user.name)}/`;
    return {
      to: basePath,
      queryParams: { ...this.props.query, ...updates },
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
