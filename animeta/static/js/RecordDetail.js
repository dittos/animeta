/* global PreloadData */
/* global initTypeahead */
var React = require('react/addons');
var {Link, Navigation} = require('react-router');
var TimeAgo = require('./TimeAgo');
var PostComposer = require('./PostComposer');
var util = require('./util');
var RecordStore = require('./RecordStore');
var PostStore = require('./PostStore');

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

var PostView = React.createClass({
    render() {
        var post = this.props.post;
        return (
            <div className={React.addons.classSet({'post-item': true, 'no-comment': !post.comment, 'pending': this.props.isPending})}>
                <div className="progress">{util.getStatusText(post)}</div>
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
            isLoading: true,
            connectedServices: this.props.canEdit &&
                PreloadData.current_user.connected_services
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
                <PostComposer
                    key={'post-composer-' + this.state.record.updated_at}
                    recordId={this.state.record.id}
                    currentStatus={this.state.record.status}
                    initialStatusType={this.state.record.status_type}
                    connectedServices={this.state.connectedServices}
                    onConnectedServicesChange={this._onConnectedServicesChange}
                    onSave={this.handleSave} />
            );
        }
        var posts = [];
        if (this.state.record.pendingPosts) {
            var i = 0;
            this.state.record.pendingPosts.forEach(pendingPost => {
                var post = pendingPost.post;
                var saved = false;
                if (!this.state.isLoading) {
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
        var pendingPostContext = RecordStore.addPendingPost(this.state.record.id, post);
        // TODO: handle failure case
        $.post('/api/v2/records/' + this.state.record.id + '/posts', post).then(result => {
            RecordStore.resolvePendingPost(pendingPostContext, result.record, result.post);
            PostStore.addRecordPost(this.state.record.id, result.post);
        });
        this.transitionTo('records');
    },

    _onConnectedServicesChange(services) {
        PreloadData.current_user.connected_services = services;
        this.setState({connectedServices: services});
    }
});

module.exports = RecordDetail;
