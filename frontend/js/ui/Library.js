var sortBy = require('lodash/sortBy');
var React = require('react');
var formatDate = require('date-fns/format');
var diffDays = require('date-fns/difference_in_calendar_days');
var diffWeeks = require('date-fns/difference_in_calendar_weeks');
var diffMonths = require('date-fns/difference_in_calendar_months');
var {Link} = require('nuri');
var util = require('../util');
import * as Styles from './Library.less';
import * as Grid from './Grid';

function getDateHeader(record) {
    const now = new Date();
    var days = diffDays(now, record.updated_at);
    if (days <= 60) {
        if (days < 1)
            return '오늘';
        else if (days < 2)
            return '어제';
        else if (days < 3)
            return '그저께';
        else if (days < 4)
            return '그끄저께';
        else if (diffWeeks(now, record.updated_at) === 0)
            return '이번 주';
        else if (diffWeeks(now, record.updated_at) === 1)
            return '지난 주';
        else if (diffMonths(now, record.updated_at) === 0)
            return '이번 달';
        else if (diffMonths(now, record.updated_at) === 1)
            return '지난 달';
    }
    return formatDate(record.updated_at, 'YYYY/MM');
}

function getIndexChar(s) {
    if (!s)
        return '#';

    s = s.replace(/^the /i, '');

    var ch = s.charAt(0);
    if ('가' <= ch && ch <= '힣') {
        // 쌍자음 처리
        var code = ch.charCodeAt(0);
        var lead = Math.floor((code - 0xAC00) / 588);
        if (lead == 1 || lead == 4 || lead == 8 || lead == 10 || lead == 13)
            lead--;
        return String.fromCharCode(0xAC00 + lead * 588);
    } else if (('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z')) {
        return ch.toUpperCase();
    } else {
        return '#';
    }
}

function groupRecordsByTitle(records) {
    records = sortBy(records, record => getIndexChar(record.title));
    var groups = [];
    var lastKey, group;
    records.forEach(record => {
        var key = getIndexChar(record.title);
        if (key != lastKey) {
            if (group)
                groups.push({key: lastKey, items: group});
            lastKey = key;
            group = [];
        }
        group.push(record);
    });
    if (group && group.length > 0)
        groups.push({key: lastKey, items: group});
    for (var i = 0; i < groups.length; i++)
        groups[i].index = 1 + i;
    return groups;
}

function groupRecordsByDate(records) {
    records = sortBy(records, record => -record.updated_at);
    var groups = [];
    var unknownGroup = [];
    var lastKey, group;
    records.forEach(record => {
        if (!record.updated_at) {
            unknownGroup.push(record);
        } else {
            var key = getDateHeader(record);
            if (key != lastKey) {
                if (group)
                    groups.push({key: lastKey, items: group});
                lastKey = key;
                group = [];
            }
            group.push(record);
        }
    });
    if (group && group.length > 0)
        groups.push({key: lastKey, items: group});
    if (unknownGroup.length)
        groups.push({key: '?', items: unknownGroup});
    for (var i = 0; i < groups.length; i++)
        groups[i].index = 1 + i;
    return groups;
}

function LibraryItem({ record }) {
    return (
        <div className={`${Styles.groupItem} item-${record.status_type}`}>
            <Link to={`/records/${record.id}/`}>
                <span className="item-title">{record.title}</span>
                <span className="item-status">{util.getStatusText(record)}</span>
                {record.has_newer_episode &&
                    <span className="item-updated">up!</span>}
            </Link>
        </div>
    );
}

class LibraryFilter extends React.Component {
    render() {
        return <div className={Styles.filter}>
            <div className={Styles.filterGroup}>
                <div className={Styles.filterGroupTitle}>상태</div>
                <div className={this.props.statusTypeFilter === '' ? Styles.filterGroupItemActive : Styles.filterGroupItem}>
                    <Link {...this.props.getLinkParams({ type: '' })}>
                        전체 ({this.props.statusTypeStats._all})
                    </Link>
                </div>
                {['watching', 'finished', 'suspended', 'interested'].map(statusType => (
                    <div className={this.props.statusTypeFilter === statusType ? Styles.filterGroupItemActive : Styles.filterGroupItem}>
                        <Link {...this.props.getLinkParams({ type: statusType })}>
                            {util.STATUS_TYPE_TEXT[statusType]} ({this.props.statusTypeStats[statusType] || 0})
                        </Link>
                    </div>
                ))}
            </div>
            <div className={Styles.filterGroup}>
                <div className={Styles.filterGroupTitle}>분류</div>
                <div className={this.props.categoryFilter === '' ? Styles.filterGroupItemActive : Styles.filterGroupItem}>
                    <Link {...this.props.getLinkParams({ category: '' })}>
                        전체 ({this.props.categoryStats._all})
                    </Link>
                </div>
                {[{id: 0, name: '미분류'}].concat(this.props.categoryList).map(category => (
                    <div className={this.props.categoryFilter === String(category.id) ? Styles.filterGroupItemActive : Styles.filterGroupItem}>
                        <Link {...this.props.getLinkParams({ category: String(category.id) })}>
                            {category.name} ({this.props.categoryStats[category.id] || 0})
                        </Link>
                    </div>
                ))}
                {' '}{this.props.canEdit && (
                    <Link to="/records/category/" className={Styles.manageCategoryButton}>
                        <i className="fa fa-cog" /> 분류 관리
                    </Link>
                )}
            </div>
        </div>;
    }
}

class Library extends React.Component {
    static contextTypes = {
        controller: React.PropTypes.object,
    };

    state = {
        mobileFilterVisible: false,
    };

    componentWillReceiveProps() {
        this.setState({ mobileFilterVisible: false });
    }

    render() {
        if (this.props.count === 0) {
            return <div>
                <h2>아직 기록이 하나도 없네요.</h2>
                {this.props.canEdit &&
                    <p>위에 있는 <Link to="/records/add/" className="add-record">작품 추가</Link>를 눌러 감상 기록을 등록할 수 있습니다.</p>}
            </div>;
        }

        var {type = '', category = '', sort} = this.props.query;
        if (!sort) sort = 'date';
        var {
            count,
            filteredCount,
            records,
            categoryStats,
            statusTypeStats,
            categoryList
        } = this.props;
        var groups;
        if (sort == 'date') {
            groups = groupRecordsByDate(records);
        } else if (sort == 'title') {
            groups = groupRecordsByTitle(records);
        }
        return <Grid.Row className={Styles.library}>
            <Grid.Column size={3} pull="left">
                {this.props.canEdit && (
                    <Link to="/records/add/" className={Styles.addRecordButton}>
                        <i className="fa fa-plus" /> 작품 추가
                    </Link>
                )}
                <div className={Styles.mobileFilterToggle} onClick={this._toggleMobileFilter}>
                    {count !== filteredCount ? '필터 (사용중)' : '필터'}
                    {' '}
                    <i className={this.state.mobileFilterVisible ? "fa fa-caret-up" : "fa fa-caret-down"} />
                </div>
                <div className={Styles.filterGroup}>
                    <span className={Styles.sortSwitchContainer}>
                        <Link
                            {...this._getLinkParams({sort: 'date'})}
                            className={sort === 'date' ? Styles.sortSwitchActive : Styles.sortSwitch}
                        >
                            시간순
                        </Link>
                        <Link
                            {...this._getLinkParams({sort: 'title'})}
                            className={sort === 'title' ? Styles.sortSwitchActive : Styles.sortSwitch}
                        >
                            제목순
                        </Link>
                    </span>
                    {sort === 'title' && (
                        <div className={Styles.toc}>
                            {groups.map(group => <a
                                href={'#group' + group.index}
                                key={group.key}
                                onClick={this._scrollToGroup}
                            >
                                {group.key}
                            </a>)}
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
                        getLinkParams={this._getLinkParams} />
                </div>
            </Grid.Column>
            <Grid.Column size={9} pull="left">
                {groups.map(group => <div className={Styles.group} key={group.key} id={'group' + group.index}>
                    <h2 className={Styles.groupTitle}>{group.key}</h2>
                    <div className={Styles.groupItems}>
                        {group.items.map(record => <LibraryItem
                            key={record.id}
                            record={record} />)}
                    </div>
                </div>)}
            </Grid.Column>
        </Grid.Row>;
    }

    _getLinkParams = (updates) => {
        const basePath = `/users/${encodeURIComponent(this.props.user.name)}/`;
        return {
            to: basePath,
            queryParams: {...this.props.query, ...updates}
        };
    };

    _scrollToGroup = (event) => {
        event.preventDefault();
        const id = event.target.hash.substring(1);
        const el = document.getElementById(id);
        if (!el) return;
        window.scrollBy(0, el.getBoundingClientRect().top - 50);
    };

    _toggleMobileFilter = (event) => {
        event.preventDefault();
        this.setState({ mobileFilterVisible: !this.state.mobileFilterVisible });
    };
}

export default Library;
