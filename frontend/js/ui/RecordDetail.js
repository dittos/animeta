/* global confirm */
import React from 'react';
import cx from 'classnames';
import * as util from '../util';
import TimeAgo from './TimeAgo';
import PostComposer from './PostComposer';
import PostComment from './PostComment';
import RecordDetailHeader from './RecordDetailHeader';
import Styles from './RecordDetail.less';
import Relay from 'react-relay';
import {
    DeletePostMutation,
} from '../mutations/PostMutations';

var PostView = React.createClass({
    render() {
        const post = this.props.post;
        const isPending = this.props.relay.hasOptimisticUpdate(post);
        return (
            <div className={cx({[Styles.post]: true, 'no-comment': !post.comment, 'pending': isPending})}>
                <div className="progress">{util.getStatusText(post)}</div>
                <PostComment post={post} className="comment" showSpoiler={this.props.canEdit} />
                <div className="meta">
                    {post.contains_spoiler &&
                        <span className={Styles.spoilerMark}><i className="fa fa-microphone-slash" /></span>}
                    {!isPending ?
                        <a href={util.getPostURL(post)} className="time"><TimeAgo time={new Date(Number(post.updated_at))} /></a>
                        : '저장 중...'}
                    {this.props.canDelete &&
                        <span className="btn-delete" onClick={this._onDelete}>지우기</span>}
                </div>
            </div>
        );
    },
    _onDelete() {
        if (confirm('삭제 후에는 복구할 수 없습니다.\n기록을 정말로 삭제하시겠습니까?')) {
            Relay.Store.commitUpdate(new DeletePostMutation({
                post: this.props.post,
                record: this.props.record
            }));
        }
    }
});

PostView = Relay.createContainer(PostView, {
    fragments: {
        post: () => Relay.QL`
            fragment on Post {
                id
                simple_id
                status
                status_type
                comment
                contains_spoiler
                updated_at
                ${DeletePostMutation.getFragment('post')}
            }
        `,
        record: () => Relay.QL`
            fragment on Record {
                ${DeletePostMutation.getFragment('record')}
            }
        `
    }
});

var RecordDetail = React.createClass({
    componentDidMount() {
        // defer posts loading
        this.props.relay.setVariables({showPosts: true});
    },
    render() {
        const canEdit = this.props.viewer && this.props.viewer.id === this.props.record.user_id;

        var composer;
        if (canEdit) {
            composer = (
                <PostComposer
                    key={'PostComposer-' + this.props.record.updated_at}
                    onSave={this._onSave}
                    viewer={this.props.viewer}
                    record={this.props.record}
                />
            );
        }
        return <div className="view-record-detail">
            <RecordDetailHeader
                record={this.props.record}
                viewer={this.props.viewer}
            />
            {composer}
            <div className={Styles.posts}>
                {this.props.record.posts && this.props.record.posts.edges.map(({node: post}) => {
                    const canDelete = canEdit && this.props.record.posts.edges.length > 1;
                    return <PostView
                        key={post.__dataID__}
                        post={post}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        record={this.props.record} />
                })}
            </div>
        </div>;
    },

    _onSave() {
        // TODO: preserve sort mode
        this.props.history.pushState(null, this.props.history.libraryPath);
    }
});

export default Relay.createContainer(RecordDetail, {
    initialVariables: {
        showPosts: false
    },
    fragments: {
        record: () => Relay.QL`
            fragment on Record {
                user_id
                updated_at
                posts(first: 10000) @include(if: $showPosts) {
                    edges {
                        node {
                            id
                            ${PostView.getFragment('post')}
                        }
                    }
                }
                ${RecordDetailHeader.getFragment('record')}
                ${PostComposer.getFragment('record')}
                ${PostView.getFragment('record')}
            }
        `,
        viewer: () => Relay.QL`
            fragment on User {
                id
                ${RecordDetailHeader.getFragment('viewer')}
                ${PostComposer.getFragment('viewer')}
            }
        `
    }
});
