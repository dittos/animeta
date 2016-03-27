import $ from 'jquery';
import React from 'react';
import {Link} from 'react-router';
import {createContainer} from '../Isomorphic';
import * as util from '../util';
import Grid from '../ui/Grid';
import TimeAgo from '../ui/TimeAgo';
import WeeklyChart from '../ui/WeeklyChart';
import PostComment from '../ui/PostComment';
import LoadMore from '../ui/LoadMore';
import {fetch} from '../store/FetchActions';
import {loadSidebarChart} from '../store/AppActions';
import Styles from '../../less/index.less';

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
            <Grid.Column size={4} pull="right" className={Styles.sidebar}>
                <h2 className={Styles.sectionTitle}>주간 인기 작품</h2>
                <WeeklyChart data={this.props.chart} />
            </Grid.Column>
        </Grid.Row>;
    },
    _renderTimeline(posts) {
        return <div className={Styles.timeline}>
            <h2 className={Styles.sectionTitle}>최근 감상평</h2>
            {posts.map(this._renderPost)}
            <LoadMore onClick={this._loadMore} isLoading={this.state.isLoading} />
        </div>;
    },
    _renderPost(post) {
        return <div className={Styles.post}>
            <div className="meta">
                <a href={'/users/' + post.user.name + '/'} className="user">{post.user.name}</a>
                <i className="fa fa-caret-right separator" />
                <Link to={util.getWorkURL(post.record.title)} className="work">{post.record.title}</Link>
                {post.status &&
                    <span className="episode">{util.getStatusDisplay(post)}</span>}
                <Link to={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></Link>
            </div>
            <PostComment post={post} className="comment" />
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
