/* global confirm */
var React = require('react/addons');
var {Container} = require('flux/utils');
var Router = require('react-router');
var TimeAgo = require('./TimeAgo');
var PostComposer = require('./PostComposer');
var util = require('./util');
var RecordActions = require('./RecordActions');
var PostActions = require('./PostActions');
var RecordStore = require('./RecordStore');
var PostStore = require('./PostStore');
var CategoryStore = require('./CategoryStore');
var ExternalServiceStore = require('./ExternalServiceStore');
var Typeahead = require('./Typeahead');

var TitleEditView = React.createClass({
    componentDidMount() {
        var typeahead = Typeahead.initSuggest(React.findDOMNode(this.refs.titleInput));
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
        this.props.onSave(React.findDOMNode(this.refs.titleInput).value);
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
        RecordActions.updateCategory(this.props.recordId, categoryId);
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
                    <Router.Link to="delete-record" params={{recordId: this.props.recordId}} className="btn btn-delete">삭제</Router.Link>
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

    _onTitleEditButtonClick(event) {
        event.preventDefault();
        this.setState({isEditingTitle: true});
    },

    _onTitleSave(title) {
        RecordActions.updateTitle(this.props.recordId, title).then(() => {
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
            <div className={React.addons.classSet({'post-item': true, 'no-comment': !post.comment, 'pending': this.props.isPending})}>
                <div className="progress">{util.getStatusText(post)}</div>
                {post.comment && <div className="comment">{post.comment}</div>}
                <div className="meta">
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
            PostActions.deletePost(this.props.post.id);
    }
});

var RecordDetail = Container.create(React.createClass({
    statics: {
        getStores() {
            return [
                RecordStore,
                PostStore,
                CategoryStore,
                ExternalServiceStore
            ];
        },
        calculateState(_, props) {
            var {recordId} = props;
            return {
                connectedServices: ExternalServiceStore.getConnectedServices(),
                lastPublishOptions: ExternalServiceStore.getLastPublishOptions(),
                record: RecordStore.get(recordId),
                posts: PostStore.findByRecordId(recordId),
                categoryList: CategoryStore.getAll()
            };
        }
    },

    componentDidMount() {
        this.loadPosts();
    },

    loadPosts() {
        this.setState({isLoading: true});
        PostActions.fetchRecordPosts(this.state.record.id).then(() => {
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
                    key={'post-composer-' + this.state.record.updated_at}
                    recordId={this.state.record.id}
                    currentStatus={this.state.record.status}
                    initialStatusType={this.state.record.status_type}
                    connectedServices={this.state.connectedServices}
                    initialPublishOptions={this.state.lastPublishOptions}
                    onSave={this._onSave} />
            );
        }
        return <div className="view-record-detail">
            <HeaderView
                canEdit={this.props.canEdit}
                recordId={this.state.record.id}
                title={this.state.record.title}
                categoryId={this.state.record.category_id}
                categoryList={this.state.categoryList} />
            {composer}
            <div className="record-detail-posts">
                {this.state.posts.map(post => {
                    var canDelete = post.id && this.props.canEdit && this.state.posts.length > 1;
                    return <PostView post={post}
                        key={post.tempID || post.id}
                        canDelete={canDelete}
                        isPending={!post.id}
                        user={this.props.user} />;
                })}
            </div>
        </div>;
    },

    _onSave(post, publishOptions) {
        PostActions.createPost(this.state.record.id, post, publishOptions);
        this.props.onSave();
    }
}), {pure: false, withProps: true});

var RecordDetailContainer = React.createClass({
    mixins: [Router.Navigation],

    render() {
        return <RecordDetail
            {...this.props}
            recordId={this.props.params.recordId}
            onSave={this._onSave}
        />;
    },

    _onSave() {
        // TODO: preserve sort mode
        this.transitionTo('records');
    }
});

module.exports = RecordDetailContainer;
