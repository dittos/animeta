var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
var {Router, Route, IndexRoute} = require('react-router');
var createBrowserHistory = require('history/lib/createBrowserHistory');
var GlobalHeader = require('./ui/GlobalHeader');
var Grid = require('./ui/Grid');
var TimeAgo = require('./ui/TimeAgo');
var util = require('./util');
var WeeklyChart = require('./ui/WeeklyChart');
if (process.env.CLIENT) {
    require('../less/index.less?extract');
}

var App = React.createClass({
    render() {
        var data = global.PreloadData;
        return <div>
            <GlobalHeader currentUser={data.current_user} />
            {React.cloneElement(this.props.children, {PreloadData: data})}
        </div>;
    }
});

var Index = React.createClass({
    getInitialState() {
        return {
            posts: this.props.PreloadData.posts,
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
                <WeeklyChart data={this.props.PreloadData.chart} />
            </Grid.Column>
        </Grid.Row>;
    },
    _renderChart(chart) {
        return <div className="weekly-chart">
            <h2><i className="fa fa-bar-chart" /> 주간 인기 작품</h2>
            {chart.map(item => {
                var work = item.object;
                var diff;
                if (item.diff) {
                    if (item.sign === -1) {
                        diff = <span className="down"><i className="fa fa-arrow-down" /> {item.diff}</span>;
                    } else if (item.sign === +1) {
                        diff = <span className="up"><i className="fa fa-arrow-up" /> {item.diff}</span>;
                    }
                }
                return <div className="chart-item">
                    {work.metadata &&
                        <a href={util.getWorkURL(work.title)} className="poster"><img src={work.metadata.image_url} /></a>}
                    <h3 className="chart-item-heading">
                        <span className="chart-item-rank">{item.rank}위</span>
                        <a className="chart-item-title" href={util.getWorkURL(work.title)}>{work.title}</a>
                        {diff}
                    </h3>
                    {item.posts.map(this._renderPost)}
                </div>;
            })}
        </div>;
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
                <a href={util.getWorkURL(post.record.title)} className="work">{post.record.title}</a>
                {post.status &&
                    <span className="episode">{util.getStatusDisplay(post)}</span>}
                <a href={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></a>
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

var LoginDialog = require('./ui/LoginDialog');
var LoginRoute = React.createClass({
    render() {
        return <LoginDialog next="/" />;
    }
});

var routes = <Route component={App} path="/">
    <IndexRoute component={Index} />
    <Route component={LoginRoute} path="/login/" />
    <Route component={require('./ui/SignupRoute')} path="/signup/" />
</Route>;

if (process.env.CLIENT) {
    ReactDOM.render(<Router history={createBrowserHistory()}>{routes}</Router>, document.getElementById('app'));
} else {
    module.exports = routes;
}
