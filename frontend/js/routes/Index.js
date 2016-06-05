import $ from 'jquery';
import React from 'react';
import {Link} from '../Isomorphic';
import * as util from '../util';
import AppLayout from '../ui/AppLayout';
import Grid from '../ui/Grid';
import TimeAgo from '../ui/TimeAgo';
import WeeklyChart from '../ui/WeeklyChart';
import PostComment from '../ui/PostComment';
import LoadMore from '../ui/LoadMore';
import Styles from '../../less/index.less';

var Index = React.createClass({
    getInitialState() {
        return {
            isLoading: false
        };
    },
    componentDidMount() {
        // Show less posts initially in mobile
        if ($(window).width() <= 480)
            this.props.setModel({posts: this.props.model.posts.slice(0, 3)});
    },
    render() {
        return <AppLayout currentUser={this.props.model.currentUser}>
            <Grid.Row>
                <Grid.Column size={8} pull="left">
                    {this._renderTimeline(this.props.model.posts)}
                </Grid.Column>
                <Grid.Column size={4} pull="right" className={Styles.sidebar}>
                    <h2 className={Styles.sectionTitle}>주간 인기 작품</h2>
                    <WeeklyChart data={this.props.model.chart} />
                </Grid.Column>
            </Grid.Row>
        </AppLayout>;
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
            before_id: this.props.model.posts[this.props.model.posts.length - 1].id,
            min_record_count: 2
        }).then(posts => {
            this.props.setModel({
                posts: this.props.model.posts.concat(posts)
            });
            this.setState({
                isLoading: false,
            });
        });
    }
});

export default {
    component: Index,

    async model({ client }) {
        const [currentUser, posts, chart] = await Promise.all([
            client.getCurrentUser(),
            client.call('/posts', {min_record_count: 2, count: 10}),
            client.call('/charts/works/weekly', {limit: 5}),
        ]);
        return {
            currentUser,
            posts,
            chart,
        };
    }
}
