/* global confirm */
var React = require('react');
var cx = require('classnames');
import {Modal} from 'react-overlays';
import {Link} from 'nuri';
var util = require('../util');
var TimeAgo = require('../ui/TimeAgo');
var PostComposer = require('../ui/PostComposer');
var Typeahead = require('../ui/Typeahead');
import PostComment from '../ui/PostComment';
var Styles = require('../ui/RecordDetail.less');
import {
    getRecordPosts,
    updateRecordTitle,
    updateRecordCategoryID,
    deleteRecord,
    deletePost,
    createPost,
} from '../API';
import connectTwitter from '../connectTwitter';
import {User} from '../layouts';
import ModalStyles from '../ui/Modal.less';
// TODO: css module

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
                <select value={String(this.props.selectedId)} onChange={this._onChange}>
                    <option value="">지정 안함</option>
                    {this.props.categoryList.map(category =>
                        <option value={String(category.id)}>{category.name}</option>
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
        const {
            record,
            currentUser,
        } = this.props;
        const canEdit = currentUser && currentUser.id === record.user.id;

        var titleEditor, editTitleButton;
        if (this.state.isEditingTitle) {
            titleEditor = <TitleEditView
                originalTitle={record.title}
                onSave={this._onTitleSave}
                onCancel={() => this.setState({isEditingTitle: false})} />;
        } else {
            titleEditor = <h1 className="record-detail-title">
                <Link to={util.getWorkURL(record.title)}>{record.title}</Link>
            </h1>;
            editTitleButton = (
                <a href="#" className="btn btn-edit-title" onClick={this._onTitleEditButtonClick}>
                    제목 수정
                </a>
            );
        }
        var toolbar;
        if (canEdit) {
            toolbar = (
                <div className="record-detail-toolbar">
                    {editTitleButton}
                    <a href="#" className="btn btn-delete" onClick={this._onDelete}>삭제</a>
                    <CategoryEditView
                        categoryList={currentUser.categories}
                        selectedId={record.category_id}
                        onChange={this.props.onCategoryChange}
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
        this.props.onTitleChange(title).then(() => {
            this.setState({isEditingTitle: false});
        });
    },

    _onDelete(event) {
        event.preventDefault();
        this.props.onDelete();
    }
});

function PostView({post, canEdit, canDelete, onDelete}) {
    return (
        <div className={cx({[Styles.post]: true, 'no-comment': !post.comment})}>
            <div className="progress">{util.getStatusText(post)}</div>
            <PostComment post={post} className="comment" showSpoiler={canEdit} />
            <div className="meta">
                {post.contains_spoiler &&
                    <span className={Styles.spoilerMark}><i className="fa fa-microphone-slash" /></span>}
                <Link to={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></Link>
                {canDelete &&
                    <span className="btn-delete" onClick={onDelete}>지우기</span>}
            </div>
        </div>
    );
}

function DeleteRecordModal({record, onConfirm, onCancel}) {
    return <Modal
        show={true}
        className={ModalStyles.container}
        backdropClassName={ModalStyles.backdrop}
        onHide={onCancel}
    >
        <div className={ModalStyles.dialog}>
            <div className={ModalStyles.header}>
                <h2 className={ModalStyles.title}>기록 삭제</h2>
            </div>
            <p>'{record.title}'에 대한 기록을 모두 삭제합니다. </p>
            <p>주의: <strong>일단 삭제하면 되돌릴 수 없으니</strong> 신중하게 생각하세요.</p>
            <button className={ModalStyles.cancelButton} onClick={onCancel}>취소</button>
            <button className={ModalStyles.dangerConfirmButton} onClick={onConfirm}>삭제</button>
        </div>
    </Modal>;
}

var Record = React.createClass({
    getInitialState() {
        return {
            posts: [],
            showDeleteModal: false,
        };
    },

    componentDidMount() {
        this.loadPosts();
    },

    loadPosts() {
        getRecordPosts(this.props.data.record.id).then(data => {
            if (this.isMounted()) {
                this.setState({
                    posts: data.posts,
                });
            }
        });
    },

    render() {
        const {user, record, currentUser} = this.props.data;
        const {posts} = this.state;
        const canEdit = currentUser && currentUser.id === record.user.id;
        var composer;
        if (canEdit) {
            composer = (
                <PostComposer
                    key={'post-composer-' + record.updated_at}
                    record={record}
                    currentUser={currentUser}
                    onSave={this._createPost}
                    onTwitterConnect={this._connectTwitter}
                />
            );
        }
        const canDeletePosts = canEdit && posts.length > 1;
        return <div className="view-record-detail">
            <HeaderView
                record={record}
                currentUser={currentUser}
                onTitleChange={this._updateTitle}
                onCategoryChange={this._updateCategory}
                onDelete={() => this.setState({showDeleteModal: true})}
            />
            {composer}
            <div className={Styles.posts}>
                {posts.map(post => <PostView
                    key={post.id}
                    post={post}
                    canEdit={canEdit}
                    canDelete={canDeletePosts}
                    user={user}
                    onDelete={() => this._deletePost(post)}
                />)}
            </div>

            {this.state.showDeleteModal &&
                <DeleteRecordModal
                    record={record}
                    onConfirm={this._deleteRecord}
                    onCancel={() => this.setState({showDeleteModal: false})}
                />}
        </div>;
    },

    _updateTitle(title) {
        return updateRecordTitle(this.props.data.record.id, title).then(record => {
            this.props.writeData(data => {
                data.record = record;
            });
        });
    },

    _updateCategory(categoryID) {
        return updateRecordCategoryID(this.props.data.record.id, categoryID).then(record => {
            this.props.writeData(data => {
                data.record = record;
            });
        });
    },

    _deleteRecord() {
        deleteRecord(this.props.data.record.id).then(() => {
            this._redirectToUser();
        });
    },

    _deletePost(post) {
        if (confirm('삭제 후에는 복구할 수 없습니다.\n기록을 정말로 삭제하시겠습니까?')) {
            deletePost(post.id).then(result => {
                this.loadPosts();
                this.props.writeData(data => {
                    data.record = result.record;
                });
            });
        }
    },

    _createPost(post) {
        createPost(this.props.data.record.id, post).then(() => {
            this._redirectToUser();
        });
    },

    _connectTwitter() {
        return connectTwitter().then(() => {
            this.props.writeData(data => {
                data.currentUser.is_twitter_connected = true;
            });
        });
    },

    _redirectToUser() {
        const basePath = `/users/${encodeURIComponent(this.props.data.user.name)}/`;
        this.props.controller.load({
            path: basePath,
            query: {},
        });
    }
});

export default {
    component: User(Record),
    
    async load({ loader, params }) {
        const {recordId} = params;
        const [currentUser, record] = await Promise.all([
            loader.getCurrentUser(),
            loader.call(`/records/${recordId}`),
        ]);
        return {
            currentUser,
            user: record.user,
            record,
        };
    },

    renderTitle({ record }) {
        return `${record.user.name} 사용자 > ${record.title}`;
    }
};
