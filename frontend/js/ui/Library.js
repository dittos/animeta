var sortBy = require('lodash/sortBy');
var React = require('react');
var formatDate = require('date-fns/format');
var diffDays = require('date-fns/difference_in_calendar_days');
var diffWeeks = require('date-fns/difference_in_calendar_weeks');
var diffMonths = require('date-fns/difference_in_calendar_months');
var {Link} = require('nuri');
var util = require('../util');

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

var LibraryItemView = React.createClass({
    render() {
        var record = this.props.record;
        var content;
        content = (
            <Link to={`/records/${record.id}/`}>
                <span className="item-title">{record.title}</span>
                <span className="item-status">{util.getStatusText(record)}</span>
                {record.has_newer_episode &&
                    <span className="item-updated">up!</span>}
            </Link>
        );
        return <li className={'library-group-item item-' + record.status_type}>{content}</li>;
    }
});

var LibraryHeader = React.createClass({
    render() {
        return <div className="library-header">
            <p>
                작품이 {this.props.count}개 등록되어 있습니다.
                {this.props.count != this.props.filteredCount &&
                    ' (' + this.props.filteredCount + '개 표시중)'}
            </p>
            <p className="sort-by">
                정렬:
                <span onClick={() => this._updateQuery({sort: 'date'})}
                    className={'btn ' + (this.props.sortBy == 'date' && 'active')}>시간순</span>
                <span onClick={() => this._updateQuery({sort: 'title'})}
                    className={'btn ' + (this.props.sortBy == 'title' && 'active')}>제목순</span>
            </p>
            <p>
                <label>상태: </label>
                <select value={this.props.statusTypeFilter}
                    onChange={this._onStatusTypeFilterChange}>
                    <option value="">전체 ({this.props.count})</option>
                {['watching', 'finished', 'suspended', 'interested'].map(statusType => {
                    return <option value={statusType}>{util.STATUS_TYPE_TEXT[statusType]} ({this.props.statusTypeStats[statusType] || 0})</option>;
                })}
                </select>
            </p>
            <p>
                <label>분류: </label>
                <select value={this.props.categoryFilter}
                    onChange={this._onCategoryFilterChange}>
                    <option value="">전체 ({this.props.count})</option>
                {[{id: 0, name: '미분류'}].concat(this.props.categoryList).map(category => {
                    return <option value={category.id}>{category.name} ({this.props.categoryStats[category.id] || 0})</option>;
                })}
                </select>
                {' '}{this.props.canEdit && <Link to="/records/category/">관리</Link>}
            </p>
        </div>;
    },

    _updateQuery(updates) {
        this.props.onUpdateQuery(updates);
    },

    _onStatusTypeFilterChange(e) {
        this._updateQuery({type: e.target.value});
    },

    _onCategoryFilterChange(e) {
        this._updateQuery({category: e.target.value});
    }
});

var Library = React.createClass({
    contextTypes: {
        controller: React.PropTypes.object,
    },

    render() {
        if (this.props.count === 0) {
            return this._renderEmpty();
        }
        var {type, category, sort} = this.props.query;
        if (!sort) sort = 'date';
        var {
            count,
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
        return <div className="library">
            <LibraryHeader
                count={count}
                filteredCount={records.length}
                sortBy={sort}
                statusTypeFilter={type}
                statusTypeStats={statusTypeStats}
                categoryFilter={category}
                categoryList={categoryList}
                categoryStats={categoryStats}
                canEdit={this.props.canEdit}
                onUpdateQuery={this._onUpdateQuery} />
            {sort == 'title' && <p className="library-toc">
                건너뛰기: {groups.map(group => <a href={'#group' + group.index}>{group.key}</a>)}
            </p>}
            {groups.map(group => <div className="library-group" key={group.key} id={'group' + group.index}>
                <h2 className="library-group-title">{group.key}</h2>
                <ul className="library-group-items">
                    {group.items.map(record => <LibraryItemView
                        key={record.id}
                        record={record} />)}
                </ul>
            </div>)}
        </div>;
    },

    _renderEmpty() {
        var help;
        if (this.props.canEdit) {
            help = <p>위에 있는 <Link to="/records/add/" className="add-record">작품 추가</Link>를 눌러 감상 기록을 등록할 수 있습니다.</p>;
        }

        return <div>
            <h2>아직 기록이 하나도 없네요.</h2>
            {help}
        </div>;
    },

    _onUpdateQuery(updates) {
        const basePath = `/users/${encodeURIComponent(this.props.user.name)}/`;
        this.context.controller.load({
            path: basePath,
            query: {...this.props.query, ...updates}
        })
    }
});

export default Library;
