var $ = require('jquery');
var React = require('react/addons');
var TimeAgo = require('./TimeAgo');
var util = require('./util');

function getDateHeader(post) {
    var date = new Date(post.updated_at);
    return date.getFullYear() + '/' + (date.getMonth() + 1);
}

var Post = React.createClass({
    render() {
        var post = this.props.post;
        return <div className={React.addons.classSet({'post-item': true, 'no-comment': !post.comment})}>
            <a href={util.getWorkURL(post.record.title)} className="title">{post.record.title}</a>
            <div className={'progress progress-' + post.status_type}>{util.getStatusText(post)}</div>
            <div className="meta">
                <a href={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></a>
            </div>
            {post.comment && <div className="comment">{post.comment}</div>}
        </div>;
    }
});

var LibraryHistory = React.createClass({
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
        var loadMore;
        if (this.state.isLoading) {
            loadMore = <div className="load-more loading">로드 중...</div>;
        } else if (this.state.hasMore) {
            loadMore = <div className="load-more" onClick={this._loadMore}>더 보기</div>;
        }

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
            {loadMore}
        </div>;
    },
    _loadMore() {
        this.setState({isLoading: true});
        var params = {count: this.props.pageSize};
        if (this.state.posts.length > 0)
            params.before_id = this.state.posts[this.state.posts.length - 1].id;
        $.get('/api/v2/users/' + this.props.user.name + '/posts', params).then(data => {
            if (this.isMounted())
                this.setState({
                    hasMore: data.length >= this.props.pageSize,
                    isLoading: false,
                    posts: this.state.posts.concat(data)
                });
        });
    }
});

module.exports = LibraryHistory;
