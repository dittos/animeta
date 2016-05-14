/* global confirm */
var React = require('react');
var cx = require('classnames');
var {connect} = require('react-redux');
var Router = require('react-router');
var util = require('../util');
var TimeAgo = require('./TimeAgo');
var PostComposer = require('./PostComposer');
var Typeahead = require('./Typeahead');
import PostComment from './PostComment';
var RecordActions = require('../store/RecordActions');
var PostActions = require('../store/PostActions');
var RecordStore = require('../store/RecordStore');
var PostStore = require('../store/PostStore');
var CategoryStore = require('../store/CategoryStore');
var ExternalServiceStore = require('../store/ExternalServiceStore');
var Styles = require('./RecordDetail.less');

var TitleEditView = React.createClass({
    componentDidMount() {
        var typeahead = Typeahead.initSuggest(this.refs.titleInput);
        typeahead.on('keypress', event => {
            if (event.keyCode == 13) {
                this._onSave();
            }
        });
    },

    render() {
        return (
            <div className="title-form">
                <input ref="titleInput" defaultValue={this.props.originalTitle} />
                <button onClick={this._onSave}>저장</button>
                {' '}<a href="#" onClick={this._onCancel}>취소</a>
            </div>
        );
    },

    _onSave() {
        this.props.onSave(this.refs.titleInput.value);
    },

    _onCancel(event) {
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
                <select value={this.props.selectedId} onChange={this._onChange}>
                    <option value="">지정 안함</option>
                    {this.props.categoryList.map(category =>
                        <option value={category.id}>{category.name}</option>
                    )}
                </select>
            </span>
        );
    },

    _onChange(event) {
        var categoryId = event.target.value;
        this.props.onChange(categoryId);
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
                originalTitle={this.props.title}
                onSave={this._onTitleSave}
                onCancel={() => this.setState({isEditingTitle: false})} />;
        } else {
            titleEditor = <h1 className="record-detail-title">
                <a href={util.getWorkURL(this.props.title)}>{this.props.title}</a>
            </h1>;
            editTitleButton = (
                <a href="#" className="btn btn-edit-title" onClick={this._onTitleEditButtonClick}>
                    제목 수정
                </a>
            );
        }
        var toolbar;
        if (this.props.canEdit) {
            toolbar = (
                <div className="record-detail-toolbar">
                    {editTitleButton}
                    <Router.Link to={`/records/${this.props.recordId}/delete/`} className="btn btn-delete">삭제</Router.Link>
                    <CategoryEditView
                        categoryList={this.props.categoryList}
                        selectedId={this.props.categoryId}
                        onChange={id => this.props.dispatch(RecordActions.updateCategory(this.props.recordId, id))}
                    />
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

    _onTitleEditButtonClick(event) {
        event.preventDefault();
        this.setState({isEditingTitle: true});
    },

    _onTitleSave(title) {
        this.props.dispatch(RecordActions.updateTitle(this.props.recordId, title)).then(() => {
            if (this.isMounted()) {
                this.setState({isEditingTitle: false});
            }
        });
    }
});

var PostView = React.createClass({
    render() {
        var post = this.props.post;
        return (
            <div className={cx({[Styles.post]: true, 'no-comment': !post.comment, 'pending': this.props.isPending})}>
                <div className="progress">{util.getStatusText(post)}</div>
                <PostComment post={post} className="comment" showSpoiler={this.props.canEdit} />
                <div className="meta">
                    {post.contains_spoiler &&
                        <span className={Styles.spoilerMark}><i className="fa fa-microphone-slash" /></span>}
                    {!this.props.isPending ?
                        <a href={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></a>
                        : '저장 중...'}
                    {this.props.canDelete &&
                        <span className="btn-delete" onClick={this._onDelete}>지우기</span>}
                </div>
            </div>
        );
    },
    _onDelete() {
        if (confirm('삭제 후에는 복구할 수 없습니다.\n기록을 정말로 삭제하시겠습니까?'))
            this.props.onDelete();
    }
});

var RecordDetail = React.createClass({
    componentDidMount() {
        this.loadPosts();
    },

    loadPosts() {
        this.setState({isLoading: true});
        this.props.dispatch(PostActions.fetchRecordPosts(this.props.record.id)).then(() => {
            if (this.isMounted()) {
                this.setState({isLoading: false});
            }
        });
    },

    render() {
        var composer;
        if (this.props.canEdit) {
            composer = (
                <PostComposer
                    key={'post-composer-' + this.props.record.updated_at}
                    recordId={this.props.record.id}
                    currentStatus={this.props.record.status}
                    initialStatusType={this.props.record.status_type}
                    connectedServices={this.props.connectedServices}
                    initialPublishOptions={this.props.lastPublishOptions}
                    onSave={this._onSave}
                    dispatch={this.props.dispatch}
                />
            );
        }
        return <div className="view-record-detail">
            <HeaderView
                canEdit={this.props.canEdit}
                recordId={this.props.record.id}
                title={this.props.record.title}
                categoryId={this.props.record.category_id}
                categoryList={this.props.categoryList}
                dispatch={this.props.dispatch}
            />
            {composer}
            <div className={Styles.posts}>
                {this.props.posts.map(post => {
                    var canDelete = post.id && this.props.canEdit && this.props.posts.length > 1;
                    return <PostView
                        post={post}
                        key={post.tempID || post.id}
                        canEdit={this.props.canEdit}
                        canDelete={canDelete}
                        isPending={!post.id}
                        user={this.props.user}
                        onDelete={() => this.props.dispatch(PostActions.deletePost(post.id))}
                    />;
                })}
            </div>
        </div>;
    },

    _onSave(post, publishOptions) {
        this.props.dispatch(PostActions.createPost(this.props.record.id, post, publishOptions));
        this.props.onSave();
    }
});

var RecordDetailRoute = Router.withRouter(React.createClass({
    render() {
        return <RecordDetail
            {...this.props}
            onSave={this._onSave}
        />;
    },

    _onSave() {
        // TODO: preserve sort mode
        this.props.router.push(this.props.router.libraryPath);
    }
}));

function select(state, props) {
    var {recordId} = props.params;
    return {
        connectedServices: ExternalServiceStore.getConnectedServices(state),
        lastPublishOptions: ExternalServiceStore.getLastPublishOptions(state),
        record: RecordStore.get(state, recordId),
        posts: PostStore.findByRecordId(state, recordId),
        categoryList: CategoryStore.getAll(state)
    };
}

module.exports = connect(select, null, null, {pure: false})(RecordDetailRoute);
