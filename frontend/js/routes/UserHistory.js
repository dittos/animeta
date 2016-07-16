import React from 'react';
import cx from 'classnames';
import {Link} from 'nuri';
import * as util from '../util';
import {getUserPosts} from '../API';
import {User} from '../layouts';
import TimeAgo from '../ui/TimeAgo';
import PostComment from '../ui/PostComment';
import LoadMore from '../ui/LoadMore';
// TODO: css module

function getDateHeader(post) {
    var date = new Date(post.updated_at);
    return date.getFullYear() + '/' + (date.getMonth() + 1);
}

function Post({post}) {
    return <div className={cx({'post-item': true, 'no-comment': !post.comment})}>
        <Link to={util.getWorkURL(post.record.title)} className="title">{post.record.title}</Link>
        <div className={'progress progress-' + post.status_type}>{util.getStatusText(post)}</div>
        <div className="meta">
            <Link to={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></Link>
        </div>
        <PostComment post={post} className="comment" />
    </div>;
}

var UserHistory = React.createClass({
    getDefaultProps() {
        return {pageSize: 32};
    },
    getInitialState() {
        return {isLoading: true, hasMore: true, posts: []};
    },
    componentDidMount() {
        this._loadMore();
    },
    render() {
        var groups = [];
        var unknownGroup = [];
        var lastKey, group;
        this.state.posts.forEach(post => {
            if (!post.updated_at) {
                unknownGroup.push(post);
            } else {
                var key = getDateHeader(post);
                if (key != lastKey) {
                    if (group)
                        groups.push({key: lastKey, items: group});
                    lastKey = key;
                    group = [];
                }
                group.push(post);
            }
        });
        if (group && group.length > 0)
            groups.push({key: lastKey, items: group});
        if (unknownGroup.length)
            groups.push({key: '?', items: unknownGroup});

        return <div className="library-history">
            {groups.map(group =>
                <div className="library-history-group">
                    <div className="library-history-group-title">{group.key}</div>
                    {group.items.map(post => <Post post={post} />)}
                </div>)}
            {this.state.hasMore &&
                <LoadMore isLoading={this.state.isLoading} onClick={this._loadMore} />}
        </div>;
    },
    _loadMore() {
        this.setState({isLoading: true});
        var beforeID;
        if (this.state.posts.length > 0)
            beforeID = this.state.posts[this.state.posts.length - 1].id;
        getUserPosts(this.props.data.user.name, this.props.pageSize, beforeID).then(data => {
            if (this.isMounted())
                this.setState({
                    hasMore: data.length >= this.props.pageSize,
                    isLoading: false,
                    posts: this.state.posts.concat(data)
                });
        });
    }
});

export default {
    component: User(UserHistory),

    async load({ loader, params }) {
        const {username} = params;
        const [currentUser, user] = await Promise.all([
            loader.getCurrentUser(),
            loader.call(`/users/${encodeURIComponent(username)}`),
        ]);
        return {
            currentUser,
            user,
        };
    },

    renderTitle({ user }) {
        return `${user.name} 사용자`;
    }
};
