import React from 'react';
import {getUserPosts} from '../API';
import {User} from '../layouts';
import * as Layout from '../ui/Layout';
import LoadMore from '../ui/LoadMore';
import { Post } from '../ui/Post';
import * as Styles from './UserHistory.less';

function getDateHeader(post) {
    var date = new Date(post.updated_at);
    return date.getFullYear() + '/' + (date.getMonth() + 1);
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

        return <Layout.CenteredFullWidth>
            {groups.map(group =>
                <div className={Styles.group}>
                    <div className={Styles.groupTitle}>{group.key}</div>
                    {group.items.map(post => <Post post={post} showUser={false} showStatusType={true} />)}
                </div>)}
            {this.state.hasMore &&
                <LoadMore isLoading={this.state.isLoading} onClick={this._loadMore} />}
        </Layout.CenteredFullWidth>;
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
            loader.call(`/users/${encodeURIComponent(username)}`, {
                include_stats: true,
            }),
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
