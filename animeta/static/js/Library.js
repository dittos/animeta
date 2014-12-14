var React = require('react/addons');
var moment = require('moment');
moment.locale('ko');
var Router = require('react-router');
var {Link} = Router;
var util = require('./util');
var RecordStore = require('./RecordStore');

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

var Library = React.createClass({
    mixins: [Router.Navigation, Router.State],

    getInitialState() {
        return {records: RecordStore.getAll(), sortBy: 'date'};
    },

    componentDidMount() {
        RecordStore.addChangeListener(this._onChange);
    },

    componentWillUnmount() {
        RecordStore.removeChangeListener(this._onChange);
    },

    _onChange() {
        this.setState({records: RecordStore.getAll()});
    },

    render() {
        if (this.state.records.length === 0) {
            return this._renderEmpty();
        }

        var query = this.getQuery();
        var records = this.state.records;
        if (query.type) {
            records = records.filter(record => record.status_type == query.type);
        }
        if (query.category) {
            records = records.filter(record => (record.category_id || 0) == query.category);
        }
        var groups;
        var sort = query.sort || 'date';
        if (sort == 'date') {
            groups = groupRecordsByDate(records);
        } else if (sort == 'title') {
            groups = groupRecordsByTitle(records);
        }
        var header = <div className="library-header">
            <p>
                작품이 {this.state.records.length}개 등록되어 있습니다.
                {this.state.records.length != records.length && ' (' + records.length + '개 표시중)'}
            </p>
            <p className="sort-by">
                정렬:
                <span onClick={() => this.updateQuery({sort: 'date'})}
                    className={'btn ' + (sort == 'date' && 'active')}>시간순</span>
                <span onClick={() => this.updateQuery({sort: 'title'})}
                    className={'btn ' + (sort == 'title' && 'active')}>제목순</span>
            </p>
            <p>
                <label>상태: </label>
                <select value={query.type} onChange={this._onStatusTypeFilterChange}>
                    <option value="">전체 ({this.state.records.length})</option>
                {['watching', 'finished', 'suspended', 'interested'].map(statusType => {
                    var recordCount = this.state.records.filter(record => record.status_type == statusType).length;
                    return <option value={statusType}>{util.STATUS_TYPE_TEXT[statusType]} ({recordCount})</option>;
                })}
                </select>
            </p>
            <p>
                <label>분류: </label>
                <select value={query.category} onChange={this._onCategoryFilterChange}>
                    <option value="">전체 ({this.state.records.length})</option>
                {this.props.user.categoryList.map(category => {
                    var recordCount = this.state.records.filter(record => (record.category_id || 0) == category.id).length;
                    return <option value={category.id}>{category.name} ({recordCount})</option>;
                })}
                </select>
                {' '}{this.props.canEdit && <a href="/records/category/">관리</a>}
            </p>
        </div>;
        var notice;
        var enableNotice = true;
        if (enableNotice && this.props.canEdit) {
            notice = (
                <div className="notice notice-animetable">
                    2015년 1월 신작을 클릭 한번으로 관심 등록!{' '}
                    <a href={'/table/2015Q1/?utm_source=self&utm_medium=link&utm_campaign=library'}>2015년 1월 신작 보러가기</a>
                </div>
            );
        }
        return <div className="library">
            {header}
            {notice}
            {query.sort == 'title' && <p className="library-toc">
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
            help = <p>위에 있는 <a href="/records/add/" className="add-record">기록 추가</a>를 눌러 감상 기록을 등록할 수 있습니다. 아니면, <a href="/records/import/">한꺼번에 기록을 여러개 추가</a>하세요.</p>;
        }

        return <div>
            <h2>아직 기록이 하나도 없네요.</h2>
            {help}
        </div>;
    },

    updateQuery(updates) {
        var requestQuery = this.getQuery();
        var query = {};
        var k;
        if (requestQuery) {
            for (k in requestQuery) {
                if (requestQuery.hasOwnProperty(k))
                    query[k] = requestQuery[k];
            }
        }
        for (k in updates) {
            if (updates.hasOwnProperty(k))
                query[k] = updates[k];
        }
        this.transitionTo('records', {}, query);
    },

    _onStatusTypeFilterChange(e) {
        this.updateQuery({type: e.target.value});
    },

    _onCategoryFilterChange(e) {
        this.updateQuery({category: e.target.value});
    }
});

module.exports = Library;
