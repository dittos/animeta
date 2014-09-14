/** @jsx React.DOM */

var events = require('events');
var parseUrl = require('url').parse;
var React = require('react');
var LayeredComponentMixin = require('react-components/js/layered-component-mixin.jsx');
var TimeAgo = require('react-components/js/timeago.jsx');
var moment = require('moment');
moment.locale('ko');
var AutoGrowInput = require('./AutoGrowInput');
var PositionSticky = require('./PositionSticky');
var util = require('./util');
require('../less/library.less');

var GlobalEvents = new events.EventEmitter();

function getWorkURL(title) {
    return '/works/' + encodeURIComponent(title) + '/';
}

function getPostURL(post) {
    return '/-' + post.id;
}

var TitleEditView = React.createClass({
    componentDidMount() {
        var typeahead = initTypeahead(this.refs.titleInput.getDOMNode());
        typeahead.on('keypress', event => {
            if (event.keyCode == 13) {
                this.handleSave();
            }
        });
    },

    render() {
        return (
            <div className="title-form">
                <input ref="titleInput" defaultValue={this.props.originalTitle} />
                <button onClick={this.handleSave}>저장</button>
                {' '}<a href="#" onClick={this.handleCancel}>취소</a>
            </div>
        );
    },

    handleSave() {
        this.props.onSave(this.refs.titleInput.getDOMNode().value);
    },

    handleCancel(event) {
        event.preventDefault();
        this.props.onCancel();
    }
});

var CategoryEditView = React.createClass({
    render() {
        var name = '지정 안함';
        if (this.props.selectedId) {
            name = this.props.categoryList.filter(
                category => category.id == this.props.selectedId
            )[0].name;
        }
        return (
            <span className="category-form btn">
                <label>분류: </label>
                {name} ▼
                <select value={this.props.selectedId} onChange={this.handleChange}>
                    <option value="">지정 안함</option>
                    {this.props.categoryList.filter(category => category.id).map(category =>
                        <option value={category.id}>{category.name}</option>
                    )}
                </select>
            </span>
        );
    },

    handleChange(event) {
        var categoryId = event.target.value;
        $.post('/api/v2/records/' + this.props.recordId, {category_id: categoryId}).then(() => {
            GlobalEvents.emit('category-edit', {
                recordId: this.props.recordId,
                newCategoryId: categoryId
            });
        });
    }
});

var HeaderView = React.createClass({
    getInitialState() {
        return {isEditingTitle: false};
    },

    render() {
        var titleEditor, editTitleButton;
        if (this.state.isEditingTitle) {
            titleEditor = <TitleEditView
                recordId={this.props.recordId}
                originalTitle={this.props.title}
                onSave={this.handleTitleSave}
                onCancel={() => this.setState({isEditingTitle: false})} />;
        } else {
            titleEditor = <h1 className="record-detail-title">{this.props.title}</h1>;
            editTitleButton = (
                <a href="#" className="btn btn-edit-title" onClick={this.handleTitleEditButtonClick}>
                    제목 수정
                </a>
            );
        }
        var toolbar;
        if (this.props.canEdit) {
            toolbar = (
                <div className="record-detail-toolbar">
                    {editTitleButton}
                    <a href={`/records/${this.props.recordId}/delete/`} className="btn btn-delete">삭제</a>
                    <CategoryEditView
                        recordId={this.props.recordId}
                        categoryList={this.props.categoryList}
                        selectedId={this.props.categoryId} />
                </div>
            );
        }

        return (
            <div className="record-detail-header">
                {titleEditor}
                {toolbar}
            </div>
        );
    },

    handleTitleEditButtonClick(event) {
        event.preventDefault();
        this.setState({isEditingTitle: true});
    },

    handleTitleSave(title) {
        $.post('/api/v2/records/' + this.props.recordId, {title: title}).then(() => {
            GlobalEvents.emit('title-edit', {
                recordId: this.props.recordId,
                newTitle: title
            });
            this.setState({isEditingTitle: false});
        });
    }
});

function plusOne(val) {
    var matches = val.match(/(\d+)[^\d]*$/);
    if (!matches)
        return val;
    var add1 = (parseInt(matches[1], 10) + 1).toString();
    var digits = matches[1].length;
    if (add1.length < digits)
        for (var i = 0; i < digits - add1.length; i++)
            add1 = '0' + add1
    return val.replace(/(\d+)([^\d]*)$/, add1 + '$2');
}

var StatusInputView = React.createClass({
    getInitialState() {
        return {showSuffix: true};
    },

    render() {
        return <span>
            {this.transferPropsTo(<AutoGrowInput
                minSize={3} maxSize={10}
                style={{textAlign: 'right'}}
                onChange={this._updateSuffix}
                ref="input" />)}
            {this.state.showSuffix ? '화' : null}
            <span className="plus-one" style={{cursor: 'pointer'}} onClick={this.handlePlusOne}>
                <img src="/static/plus.gif" alt="+1" />
            </span>
        </span>;
    },

    componentDidMount() {
        this._updateSuffix();
    },

    _updateSuffix() {
        var input = this.refs.input.getDOMNode();
        this.setState({showSuffix: input.value.match(/^(|.*\d)$/)});
    },

    handlePlusOne() {
        var input = this.refs.input.getDOMNode();
        var newValue = plusOne(input.value);
        input.value = newValue;
    }
});

var PostComposerView = React.createClass({
    render() {
        var currentStatus;
        if (this.props.currentStatus) {
            currentStatus = <span className="progress-current">{this.props.currentStatus} &rarr; </span>;
        }
        return <form className="record-detail-update" method="post"
                data-connected-services={this.props.connectedServices.join(' ')}>
            <div className="progress">
                <select name="status_type" defaultValue={this.props.initialStatusType}>
                    <option value="watching">보는 중</option>
                    <option value="finished">완료</option>
                    <option value="suspended">중단</option>
                    <option value="interested">볼 예정</option>
                </select>
                {' @ '}
                {currentStatus}
                <StatusInputView name="status"
                    defaultValue={plusOne(this.props.currentStatus)} />
            </div>
            <textarea name="comment" rows={3} cols={30} autoFocus />
            <div className="actions">
                {'공유: '}
                <input type="checkbox" id="id_publish_twitter" name="publish_twitter" />
                <label htmlFor="id_publish_twitter">트위터</label>
                <input type="checkbox" id="id_publish_facebook" name="publish_facebook" />
                <label htmlFor="id_publish_facebook">페이스북</label>
                <button type="button" onClick={this.handleSubmit}>기록 추가</button>
            </div>
        </form>;
    },

    componentDidMount() {
        initServiceToggles($(this.getDOMNode()));
    },

    handleSubmit(event) {
        event.preventDefault();
        var data = $(this.getDOMNode()).serialize();
        $.post('/api/v2/records/' + this.props.recordId + '/posts', data).then(result => {
            GlobalEvents.emit('post-create', {
                record: result.record,
                post: result.post
            });
            this.props.onSave(result.post);
        });
    }
});

var PostView = React.createClass({
    render() {
        var post = this.props.post;
        return (
            <div className="post-item">
                <div className="progress">{getStatusText(post)}</div>
                {post.comment && <div className="comment">{post.comment}</div>}
                <div className="meta">
                    <a href={getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></a>
                </div>
            </div>
        );
    }
});

var RecordDetailView = React.createClass({
    getInitialState() {
        return {isLoading: true};
    },

    componentDidMount() {
        this.loadPosts();
    },

    componentDidUpdate(prevProps) {
        if (this.props.record.id != prevProps.record.id)
            this.loadPosts();
    },

    loadPosts() {
        this.setState({isLoading: true});
        $.get('/api/v2/records/' + this.props.record.id + '/posts').then(result => {
            if (this.isMounted())
                this.setState({isLoading: false, posts: result.posts});
        });
    },

    render() {
        var composer;
        if (this.props.canEdit) {
            composer = (
                <PostComposerView
                    key={'post-composer-' + this.props.record.updated_at}
                    recordId={this.props.record.id}
                    currentStatus={this.props.record.status}
                    initialStatusType={this.props.record.status_type}
                    connectedServices={PreloadData.current_user.connected_services}
                    onSave={this.handleSave} />
            );
        }
        return <div className="view-record-detail modal">
            {this.props.onClose && <span className="close" onClick={this.props.onClose}>&times;</span>}
            <HeaderView
                canEdit={this.props.canEdit}
                recordId={this.props.record.id}
                title={this.props.record.title}
                categoryId={this.props.record.category_id}
                categoryList={this.props.user.categoryList} />
            {composer}
            <div className="record-detail-posts">
                {!this.state.isLoading &&
                    this.state.posts.map(post => <PostView post={post} key={post.id} />)}
            </div>
        </div>;
    },

    handleSave(post) {
        this.setState({posts: [post].concat(this.state.posts)});
    }
});

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

function getStatusDisplay(record) {
    return record.status.trim().replace(/([0-9]+)$/, '$1화');
}

var STATUS_TYPE_TEXT = {
    watching: '보는 중',
    finished: '완료',
    interested: '볼 예정',
    suspended: '중단'
};

function getStatusText(record) {
    var status = getStatusDisplay(record);
    if (record.status_type != 'watching' || status == '') {
        var statusTypeText = STATUS_TYPE_TEXT[record.status_type];
        if (status != '') {
            status += ' (' + statusTypeText + ')';
        } else {
            status = statusTypeText;
        }
    }
    return status;
}

var LibraryItemView = React.createClass({
    render() {
        var record = this.props.record;
        var content;
        content = (
            <a href={'/records/' + record.id + '/'} onClick={this.handleClick} className={this.props.isActive && 'active'}>
                <span className="item-title">{record.title}</span>
                <span className="item-status">{getStatusText(record)}</span>
            </a>
        );
        return <li className={'library-group-item item-' + record.status_type}>{content}</li>;
    },

    handleClick(e) {
        if (e.button == 0) { // left click
            e.preventDefault();
            this.props.onClick();
        }
    }
});

var LibraryView = React.createClass({
    mixins: [LayeredComponentMixin],

    getInitialState() {
        return {
            records: this.props.initialRecords,
            sortBy: this.props.initialFilters.sort || 'date',
            statusTypeFilter: this.props.initialFilters.type,
            categoryFilter: this.props.initialFilters.category
        };
    },

    findRecord(id) {
        return this.state.records.filter(record => record.id == id)[0];
    },

    componentDidMount() {
        GlobalEvents.on('title-edit', event => {
            var record = this.findRecord(event.recordId);
            record.title = event.newTitle;
            this.setState({records: this.state.records});
        });
        GlobalEvents.on('category-edit', event => {
            var record = this.findRecord(event.recordId);
            record.category_id = event.newCategoryId;
            this.setState({records: this.state.records});
        });
        GlobalEvents.on('post-create', event => {
            var record = this.findRecord(event.record.id);
            for (var k in event.record) {
                if (event.record.hasOwnProperty(k))
                    record[k] = event.record[k];
            }
            this.setState({records: this.state.records}, () => {
                if (this.state.sortBy == 'date')
                    window.scrollTo(0, 0);
            });
            this.closeItem();
        });
    },

    render() {
        if (!this.state.records) {
            return <div>로드 중...</div>;
        }
        if (this.state.records.length == 0) {
            return this._renderEmpty();
        }

        var records = this.state.records;
        if (this.state.statusTypeFilter) {
            records = records.filter(record => record.status_type == this.state.statusTypeFilter);
        }
        if (this.state.categoryFilter) {
            records = records.filter(record => (record.category_id || 0) == this.state.categoryFilter);
        }
        var groups;
        if (this.state.sortBy == 'date') {
            groups = groupRecordsByDate(records);
        } else if (this.state.sortBy == 'title') {
            groups = groupRecordsByTitle(records);
        }
        var header = <div className="library-header">
            <p>
                작품이 {this.state.records.length}개 등록되어 있습니다.
                {this.state.records.length != records.length && ' (' + records.length + '개 표시중)'}
            </p>
            <p className="sort-by">
                정렬:
                <span onClick={() => this.setState({sortBy: 'date'})}
                    className={'btn ' + (this.state.sortBy == 'date' && 'active')}>시간순</span>
                <span onClick={() => this.setState({sortBy: 'title'})}
                    className={'btn ' + (this.state.sortBy == 'title' && 'active')}>제목순</span>
            </p>
            <p>
                <label>상태: </label>
                <select value={this.state.statusTypeFilter} onChange={this.handleStatusTypeFilterChange}>
                    <option value="">전체 ({this.state.records.length})</option>
                {['watching', 'finished', 'suspended', 'interested'].map(statusType => {
                    var recordCount = this.state.records.filter(record => record.status_type == statusType).length;
                    return <option value={statusType}>{STATUS_TYPE_TEXT[statusType]} ({recordCount})</option>;
                })}
                </select>
            </p>
            <p>
                <label>분류: </label>
                <select value={this.state.categoryFilter} onChange={this.handleCategoryFilterChange}>
                    <option value="">전체 ({this.state.records.length})</option>
                {this.props.user.categoryList.map(category => {
                    var recordCount = this.state.records.filter(record => (record.category_id || 0) == category.id).length;
                    return <option value={category.id}>{category.name} ({recordCount})</option>;
                })}
                </select>
                {' '}{this.props.canEdit && <a href="/records/category/">관리</a>}
            </p>
        </div>;
        return <div className="library">
            {header}
            {this.state.sortBy == 'title' && <p>
                건너뛰기: {groups.map(group => <a href={'#group' + group.index}>{group.key}</a>)}
            </p>}
            {groups.map(group => <div className="library-group" key={group.key} id={'group' + group.index}>
                <h2 className="library-group-title">{group.key}</h2>
                <ul className="library-group-items">
                    {group.items.map(record => <LibraryItemView
                        onClick={() => this.handleItemClick(record)}
                        isActive={this.state.activeItem == record}
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

    handleStatusTypeFilterChange(e) {
        this.setState({statusTypeFilter: e.target.value});
    },

    handleCategoryFilterChange(e) {
        this.setState({categoryFilter: e.target.value});
    },

    handleItemClick(item) {
        this.setState({activeItem: item});
        if ('pushState' in history)
            history.pushState(null, '', '/records/' + item.id + '/');
    },

    closeItem() {
        this.setState({activeItem: null});
        if ('pushState' in history)
            history.pushState(null, '', '/users/' + this.props.user.name + '/');
    },

    renderLayer() {
        if (!this.state.activeItem)
            return <noscript />;

        return <div className="modal-container"
            onClick={this.closeItemIfOutsideClicked}>
            <RecordDetailView
                user={this.props.user}
                record={this.state.activeItem}
                canEdit={this.props.canEdit}
                onClose={this.closeItem} />
        </div>;
    },

    closeItemIfOutsideClicked(e) {
        if (e.target.className == 'modal-container')
            this.closeItem();
    },

    setActiveItemId(id) {
        var item = this.state.records.filter(record => record.id == id)[0];
        this.setState({activeItem: item});
    }
});

// Backward compat
if (location.search)
    location.href = location.pathname + '#' + location.search;

var initialFilters = {};
var initialActiveItemId;
if (location.hash) {
    var url = parseUrl(location.hash.substring(1), true);
    var targetUrl = location.pathname;
    initialFilters = url.query;
    var match = url.pathname && url.pathname.match(/^\/records\/([0-9]+)\/$/);
    if (match) {
        initialActiveItemId = Number(match[1]);
        targetUrl = '/records/' + initialActiveItemId + '/';
    }
    if ('replaceState' in history)
        history.replaceState(null, '', targetUrl);
    else
        location.hash = '';
}

var user = PreloadData.owner;
user.categoryList = PreloadData.categories;
var canEdit = PreloadData.current_user && PreloadData.current_user.id == user.id;

var root = React.renderComponent(<LibraryView
    initialRecords={PreloadData.records}
    initialFilters={initialFilters}
    user={user}
    canEdit={canEdit} />,
$('.library-container')[0]);

if (initialActiveItemId) {
    root.setActiveItemId(initialActiveItemId);
}

// URL 관리 전략
// - pushState를 제대로 지원 안하는 브라우저에서는 URL을 건드리지 않고 상태만 변경.
// - pushState를 지원하는 경우 URL을 건드린다.
//   * 단, 개별 페이지로 링크가 필요한 경우에만.
//   * 뒤로/앞으로 시에 이전 상태를 복구해야 한다.

window.addEventListener('popstate', () => {
    var params = location.pathname.match(/^\/records\/([0-9]+)\/$/);
    var activeItemId;
    if (params) {
        activeItemId = params[1];
    }
    root.setActiveItemId(activeItemId);
});

$(document).ajaxError((event, jqXHR, settings, thrownError) => {
    if (jqXHR.responseText) {
        try {
            var err = $.parseJSON(jqXHR.responseText);
            alert(err.message);
            return;
        } catch (e) {
        }
    }
    alert('서버 오류로 요청에 실패했습니다.');
});
