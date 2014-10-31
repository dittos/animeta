/** @jsx React.DOM */

var React = require('react/addons');
var moment = require('moment');
moment.locale('ko');
var {Routes, Route, DefaultRoute, Link, Navigation} = require('react-router');
var StatusInputView = require('./StatusInputView');
var TimeAgo = require('./TimeAgo');
var util = require('./util');
var RecordStore = require('./RecordStore');
var PostStore = require('./PostStore');
require('../less/library.less');

function getWorkURL(title) {
    return '/works/' + encodeURIComponent(title) + '/';
}

function getPostURL(post) {
    return '/-' + post.id;
}

function getPostDeleteURL(user, post) {
    return '/users/' + user.name + '/history/' + post.id + '/delete/';
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
            RecordStore.updateCategory(this.props.recordId, categoryId);
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
            titleEditor = <h1 className="record-detail-title">
                <a href={getWorkURL(this.props.title)}>{this.props.title}</a>
            </h1>;
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
            RecordStore.updateTitle(this.props.recordId, title);
            this.setState({isEditingTitle: false});
        });
    }
});

var PostComposerView = React.createClass({
    getInitialState() {
        return {
            statusType: this.props.initialStatusType,
            status: util.plusOne(this.props.currentStatus),
            comment: ''
        };
    },

    render() {
        var currentStatus;
        if (this.props.currentStatus) {
            currentStatus = <span className="progress-current">{this.props.currentStatus} &rarr; </span>;
        }
        return <form className="record-detail-update" method="post"
                data-connected-services={this.props.connectedServices.join(' ')}>
            <div className="progress">
                <select name="status_type"
                    value={this.state.statusType}
                    onChange={this._onStatusTypeChange}>
                    <option value="watching">보는 중</option>
                    <option value="finished">완료</option>
                    <option value="suspended">중단</option>
                    <option value="interested">볼 예정</option>
                </select>
                {' @ '}
                {currentStatus}
                <StatusInputView name="status"
                    value={this.state.status}
                    onChange={this._onStatusChange} />
            </div>
            <textarea name="comment" rows={3} cols={30} autoFocus
                value={this.state.comment}
                onChange={this._onCommentChange} />
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
        // XXX: Just trigger the submit "handler" only to save publish settings.
        // Should be replaced with explicit call later.
        $(this.getDOMNode()).triggerHandler('submit');
        var pendingPostContext = RecordStore.addPendingPost(this.props.recordId, {
            status: this.state.status,
            status_type: this.state.statusType,
            comment: this.state.comment
        });
        this.props.onSave();
        var data = $(this.getDOMNode()).serialize();
        // TODO: handle failure case
        $.post('/api/v2/records/' + this.props.recordId + '/posts', data).then(result => {
            RecordStore.resolvePendingPost(pendingPostContext, result.record, result.post);
            PostStore.addRecordPost(this.props.recordId, result.post);
        });
    },

    _onStatusTypeChange(event) {
        this.setState({statusType: event.target.value});
    },

    _onStatusChange(newValue) {
        this.setState({status: newValue});
    },

    _onCommentChange(event) {
        this.setState({comment: event.target.value});
    }
});

var PostView = React.createClass({
    render() {
        var post = this.props.post;
        return (
            <div className={React.addons.classSet({'post-item': true, 'no-comment': !post.comment, 'pending': this.props.isPending})}>
                <div className="progress">{getStatusText(post)}</div>
                {post.comment && <div className="comment">{post.comment}</div>}
                <div className="meta">
                    {!this.props.isPending ?
                        <a href={getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></a>
                        : '저장 중...'}
                    {this.props.canDelete && <a href={getPostDeleteURL(this.props.user, post)} className="btn-delete">지우기</a>}
                </div>
            </div>
        );
    }
});

var RecordDetail = React.createClass({
    mixins: [Navigation],

    getInitialState() {
        return {
            record: RecordStore.get(this.props.params.recordId),
            isLoading: true
        };
    },

    componentDidMount() {
        RecordStore.addChangeListener(this._onChange);
        PostStore.addChangeListener(this._onChange);
        this.loadPosts();
    },

    componentWillUnmount() {
        RecordStore.removeChangeListener(this._onChange);
        PostStore.removeChangeListener(this._onChange);
    },

    _onChange() {
        this.setState({
            record: RecordStore.get(this.props.params.recordId),
            posts: PostStore.findByRecordId(this.props.params.recordId)
        });
    },

    loadPosts() {
        this.setState({isLoading: true});
        $.get('/api/v2/records/' + this.state.record.id + '/posts').then(result => {
            if (this.isMounted()) {
                PostStore.loadRecordPosts(this.state.record.id, result.posts);
                this.setState({isLoading: false});
            }
        });
    },

    render() {
        var composer;
        if (this.props.canEdit) {
            composer = (
                <PostComposerView
                    key={'post-composer-' + this.state.record.updated_at}
                    recordId={this.state.record.id}
                    currentStatus={this.state.record.status}
                    initialStatusType={this.state.record.status_type}
                    connectedServices={PreloadData.current_user.connected_services}
                    onSave={this.handleSave} />
            );
        }
        var posts = [];
        if (this.state.record.pendingPosts) {
            var i = 0;
            this.state.record.pendingPosts.forEach(pendingPost => {
                var post = pendingPost.post;
                if (!this.state.isLoading) {
                    var saved = false;
                    this.state.posts.forEach(savedPost => {
                        if (savedPost.status == post.status &&
                            savedPost.status_type == post.status_type &&
                            savedPost.comment == post.comment) {
                            saved = true;
                        }
                    });
                }
                if (!saved) {
                    posts.push(<PostView post={post} key={--i}
                        canDelete={false}
                        isPending={true} />);
                }
            });
        }
        if (!this.state.isLoading) {
            var canDelete = this.props.canEdit && this.state.posts.length > 1;
            this.state.posts.forEach(post => {
                posts.push(
                    <PostView post={post} key={post.id}
                        canDelete={canDelete}
                        user={this.props.user} />
                );
            });
        }
        return <div className="view-record-detail">
            <HeaderView
                canEdit={this.props.canEdit}
                recordId={this.state.record.id}
                title={this.state.record.title}
                categoryId={this.state.record.category_id}
                categoryList={this.props.user.categoryList} />
            {composer}
            <div className="record-detail-posts">
                {posts}
            </div>
        </div>;
    },

    handleSave(post) {
        // TODO: preserve sort mode
        this.transitionTo('records');
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
            <Link to="record" params={{recordId: record.id}}>
                <span className="item-title">{record.title}</span>
                <span className="item-status">{getStatusText(record)}</span>
            </Link>
        );
        return <li className={'library-group-item item-' + record.status_type}>{content}</li>;
    }
});

var Library = React.createClass({
    mixins: [Navigation],

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
        if (this.state.records.length == 0) {
            return this._renderEmpty();
        }

        var records = this.state.records;
        if (this.props.query.type) {
            records = records.filter(record => record.status_type == this.props.query.type);
        }
        if (this.props.query.category) {
            records = records.filter(record => (record.category_id || 0) == this.props.query.category);
        }
        var groups;
        var sort = this.props.query.sort || 'date';
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
                <select value={this.props.query.type} onChange={this.handleStatusTypeFilterChange}>
                    <option value="">전체 ({this.state.records.length})</option>
                {['watching', 'finished', 'suspended', 'interested'].map(statusType => {
                    var recordCount = this.state.records.filter(record => record.status_type == statusType).length;
                    return <option value={statusType}>{STATUS_TYPE_TEXT[statusType]} ({recordCount})</option>;
                })}
                </select>
            </p>
            <p>
                <label>분류: </label>
                <select value={this.props.query.category} onChange={this.handleCategoryFilterChange}>
                    <option value="">전체 ({this.state.records.length})</option>
                {this.props.user.categoryList.map(category => {
                    var recordCount = this.state.records.filter(record => (record.category_id || 0) == category.id).length;
                    return <option value={category.id}>{category.name} ({recordCount})</option>;
                })}
                </select>
                {' '}{this.props.canEdit && <a href="/records/category/">관리</a>}
            </p>
        </div>;
        var notice = (
            <div className="notice notice-animetable">
                10월 신작을 클릭 한번으로 관심 등록!{' '}
                <a href={'/table/2014Q4/?utm_source=self&utm_medium=link&utm_campaign=library'}>2014년 10월 신작 보러가기</a>
            </div>
        );
        return <div className="library">
            {header}
            {notice}
            {this.state.sortBy == 'title' && <p className="library-toc">
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
        var query = {};
        if (this.props.query) {
            for (var k in this.props.query) {
                if (this.props.query.hasOwnProperty(k))
                    query[k] = this.props.query[k];
            }
        }
        for (var k in updates) {
            if (updates.hasOwnProperty(k))
                query[k] = updates[k];
        }
        this.transitionTo(this.props.name, {}, query);
    },

    handleStatusTypeFilterChange(e) {
        this.updateQuery({type: e.target.value});
    },

    handleCategoryFilterChange(e) {
        this.updateQuery({category: e.target.value});
    }
});

var App = React.createClass({
    mixins: [Navigation],

    render() {
        var user = PreloadData.owner;
        user.categoryList = PreloadData.categories;
        var canEdit = PreloadData.current_user && PreloadData.current_user.id == user.id;
        return <this.props.activeRouteHandler user={user} canEdit={canEdit} />;
    },

    componentDidMount() {
        $('#nav h1 a').on('click', event => {
            event.preventDefault();
            this.transitionTo('records');
        });
    }
});

RecordStore.preload(PreloadData.records);

React.renderComponent(
    <Routes location="history">
        <Route path={'/users/' + PreloadData.owner.name + '/'} handler={App}>
            <DefaultRoute name="records" handler={Library} />
            <Route name="record" path="/records/:recordId/" handler={RecordDetail} addHandlerKey={true} />
        </Route>
    </Routes>,
$('.library-container')[0]);

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

$(window).on('beforeunload', event => {
    if (RecordStore.hasPendingPosts()) {
        return '아직 저장 중인 기록이 있습니다.';
    }
});
