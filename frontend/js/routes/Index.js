import $ from 'jquery';
import React from 'react';
import {Link} from 'react-router';
import {createContainer} from '../Isomorphic';
import * as util from '../util';
import Grid from '../ui/Grid';
import TimeAgo from '../ui/TimeAgo';
import WeeklyChart from '../ui/WeeklyChart';
import {fetch} from '../store/FetchActions';
import {loadSidebarChart} from '../store/AppActions';

var Index = React.createClass({
    getInitialState() {
        return {
            posts: this.props.posts,
            isLoading: false
        };
    },
    componentDidMount() {
        // Show less posts initially in mobile
        if ($(window).width() <= 480)
            this.setState({posts: this.state.posts.slice(0, 3)});
    },
    render() {
        return <Grid.Row>
            <Grid.Column size={8} pull="left">
                {this._renderTimeline(this.state.posts)}
            </Grid.Column>
            <Grid.Column size={4} pull="right">
                <WeeklyChart data={this.props.chart} />
            </Grid.Column>
        </Grid.Row>;
    },
    _renderTimeline(posts) {
        var loadMore;
        if (this.state.isLoading) {
            loadMore = <div className="load-more loading">로드 중...</div>;
        } else {
            loadMore = <div className="load-more" onClick={this._loadMore}>더 보기</div>;
        }

        return <div className="timeline">
            <h2 className="section-title">최근 감상평</h2>
            {posts.map(this._renderPost)}
            {loadMore}
        </div>;
    },
    _renderPost(post) {
        return <div className="post-item">
            <div className="meta">
                <a href={'/users/' + post.user.name + '/'} className="user">{post.user.name}</a>
                <i className="fa fa-caret-right separator" />
                <Link to={util.getWorkURL(post.record.title)} className="work">{post.record.title}</Link>
                {post.status &&
                    <span className="episode">{util.getStatusDisplay(post)}</span>}
                <Link to={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></Link>
            </div>
            <div className="comment">
                {post.comment}
            </div>
        </div>;
    },
    _loadMore() {
        this.setState({isLoading: true});
        $.get('/api/v2/posts', {
            before_id: this.state.posts[this.state.posts.length - 1].id,
            min_record_count: 2
        }).then(data => {
            this.setState({
                isLoading: false,
                posts: this.state.posts.concat(data)
            });
        });
    }
});

const KEY_POSTS = 'index/posts';

export default createContainer(Index, {
    select(state) {
        return {
            posts: state.fetches[KEY_POSTS],
            chart: state.app.sidebarChart,
        };
    },

    fetchData(getState, dispatch) {
        return Promise.all([
            dispatch(fetch(KEY_POSTS, '/posts', {
                min_record_count: 2,
                count: 10
            })),
            dispatch(loadSidebarChart()),
        ]);
    },
});
