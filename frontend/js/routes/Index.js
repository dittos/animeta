import $ from 'jquery';
import React from 'react';
import {Link} from 'nuri';
import * as util from '../util';
import {App} from '../layouts';
import * as Grid from '../ui/Grid';
import TimeAgo from '../ui/TimeAgo';
import WeeklyChart from '../ui/WeeklyChart';
import PostComment from '../ui/PostComment';
import LoadMore from '../ui/LoadMore';
import Styles from '../../less/index.less';
// TODO: css module

class Index extends React.Component {
    state = {
        isLoading: false,
    };

    componentDidMount() {
        // Show less posts initially in mobile
        if ($(window).width() <= 480) {
            this.props.writeData(data => {
                data.posts = data.posts.slice(0, 3);
            });
        }
    }

    render() {
        return <Grid.Row>
            <Grid.Column size={8} pull="left">
                {this._renderTimeline(this.props.data.posts)}
            </Grid.Column>
            <Grid.Column size={4} pull="right" className={Styles.sidebar}>
                <h2 className={Styles.sectionTitle}>주간 인기 작품</h2>
                <WeeklyChart data={this.props.data.chart} />
            </Grid.Column>
        </Grid.Row>;
    }

    _renderTimeline(posts) {
        return <div className={Styles.timeline}>
            <h2 className={Styles.sectionTitle}>최근 감상평</h2>
            {posts.map(this._renderPost)}
            <LoadMore onClick={this._loadMore} isLoading={this.state.isLoading} />
        </div>;
    }

    _renderPost(post) {
        return <div className={Styles.post}>
            <div className="meta">
                <Link to={'/users/' + post.user.name + '/'} className="user">{post.user.name}</Link>
                <i className="fa fa-caret-right separator" />
                <Link to={util.getWorkURL(post.record.title)} className="work">{post.record.title}</Link>
                {post.status &&
                    <span className="episode">{util.getStatusDisplay(post)}</span>}
                <Link to={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></Link>
            </div>
            <PostComment post={post} className="comment" />
        </div>;
    }

    _loadMore = async () => {
        this.setState({isLoading: true});
        const result = await this.props.loader.call('/posts', {
            before_id: this.props.data.posts[this.props.data.posts.length - 1].id,
            min_record_count: 2
        });
        this.setState({
            isLoading: false,
        });
        this.props.writeData(data => {
            data.posts = data.posts.concat(result);
        });
    };
}

export default {
    component: App(Index),

    async load({ loader }) {
        const [currentUser, posts, chart] = await Promise.all([
            loader.getCurrentUser(),
            loader.call('/posts', {min_record_count: 2, count: 10}),
            loader.call('/charts/works/weekly', {limit: 5}),
        ]);
        return {
            currentUser,
            posts,
            chart,
        };
    }
};
