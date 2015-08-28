var React = require('react/addons');
var moment = require('moment');
var Router = require('react-router');
var {Link} = Router;
var {Container} = require('flux/utils');
var util = require('./util');
var RecordStore = require('./RecordStore');
var CategoryStore = require('./CategoryStore');

function getDateHeader(record) {
    var date = moment(record.updated_at).startOf('day');
    var today = moment().startOf('day');
    var days = today.diff(date, 'days');
    if (days <= 60) {
        if (days < 1)
            return '오늘';
        else if (days < 2)
            return '어제';
        else if (days < 3)
            return '그저께';
        else if (days < 4)
            return '그끄저께';
        else if (date.isSame(today, 'week'))
            return '이번 주';
        else if (date.isSame(today.clone().subtract(1, 'week'), 'week'))
            return '지난 주';
        else if (date.isSame(today, 'month'))
            return '이번 달';
        else if (date.isSame(today.clone().subtract(1, 'month'), 'month'))
            return '지난 달';
    }
    return date.format('YYYY/MM');
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
    records.sort(util.keyComparator(record => getIndexChar(record.title)));
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
    records.sort(util.keyComparator(record => -record.updated_at));
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
            <Link to="record" params={{recordId: record.id}}>
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
                {' '}{this.props.canEdit && <Link to="manage-category">관리</Link>}
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

var Library = Container.create(React.createClass({
    statics: {
        getStores() {
            return [RecordStore, CategoryStore];
        },
        calculateState(_, props) {
            var count = RecordStore.getCount();
            if (count === 0) {
                return {count};
            }

            var {type, category, sort} = props.query;
            if (!sort) sort = 'date';
            return {
                count: RecordStore.getCount(),
                records: RecordStore.query(type, category, sort),
                categoryStats: RecordStore.getCategoryStats(),
                statusTypeStats: RecordStore.getStatusTypeStats(),
                categoryList: CategoryStore.getAll()
            };
        }
    },

    render() {
        if (this.state.count === 0) {
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
        } = this.state;
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
                onUpdateQuery={this.props.onUpdateQuery} />
            {this._renderNotice()}
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
            help = <p>위에 있는 <Link to="add-record" className="add-record">작품 추가</Link>를 눌러 감상 기록을 등록할 수 있습니다.</p>;
        }

        return <div>
            <h2>아직 기록이 하나도 없네요.</h2>
            {help}
        </div>;
    },

    _renderNotice() {
        var enableNotice = true;
        if (enableNotice && this.props.canEdit) {
            return <div className="notice notice-animetable">
                2015년 7월 신작을 클릭 한번으로 관심 등록!{' '}
                <a href={'/table/2015Q3/?utm_source=self&utm_medium=link&utm_campaign=library'}>2015년 7월 신작 보러가기</a>
            </div>;
        }
        return null;
    }
}), {pure: false, withProps: true});

var LibraryContainer = React.createClass({
    mixins: [Router.Navigation],
    render() {
        return <Library
            {...this.props}
            query={this.props.query}
            onUpdateQuery={this._onUpdateQuery}
        />;
    },
    _onUpdateQuery(updates) {
        this.transitionTo('records', {}, {...this.props.query, ...updates});
    }
});

module.exports = LibraryContainer;
