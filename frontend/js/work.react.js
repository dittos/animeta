/* global PreloadData */
require('object.assign').shim();
var $ = require('jquery');
var React = require('react/addons');
var Router = require('react-router');
var moment = require('moment');
moment.locale('ko');
var TimeAgo = require('./TimeAgo');
var Grid = require('./Grid');
var Layout = require('./Layout');
var GlobalHeader = require('./GlobalHeader');
var util = require('./util');
require('../less/work.less');
require('style!css!font-awesome/css/font-awesome.css');

function fixTitle(title) {
    // &lt;b&gt;...&lt;b&gt; -> <b>...</b>
    return $('<span />').html(title.replace(/&lt;(\/?b)&gt;/g, "<$1>")).text();
}

function formatDate(t) {
    // YYYYMMDDHHMMSS
    var d = new Date(parseInt(t.substr(0,4), 10), parseInt(t.substr(4,2), 10) - 1, parseInt(t.substr(6,2), 10));
    return d.toLocaleDateString();
}

function shorten(str, limit) {
    if (str.length > limit)
        str = str.substring(0, limit - 3) + '...';
    return str;
}

var VideoSearchResult = React.createClass({
    getInitialState() {
        return {isLoading: true, hasMore: true, result: []};
    },

    componentDidMount() {
        this._loadMore();
    },

    componentWillReceiveProps(nextProps) {
        if (this.props.query != nextProps.query) {
            this.setState({
                isLoading: true,
                hasMore: true,
                result: [],
                page: 0
            }, this._loadMore);
        }
    },

    _loadMore() {
        var page = (this.state.page || 0) + 1;
        this.setState({isLoading: true});
        $.getJSON('http://apis.daum.net/search/vclip?callback=?', {
            apikey: PreloadData.daum_api_key,
            output: 'json',
            result: 5,
            q: this.props.query,
            pageno: page
        }).then(data => {
            var result = this.state.result.concat(data.channel.item);
            var totalCount = parseInt(data.channel.totalCount, 10);
            this.setState({
                hasMore: result.length < totalCount,
                page: page,
                isLoading: false,
                result: result
            }, () => {
                if (page > 1) {
                    var $el = $(this.getDOMNode());
                    window.scrollTo(0, $el.offset().top + $el.height() - $(window).height() + 100);
                }
            });
        });
    },

    render() {
        if (!this.state.isLoading && this.state.result.length === 0)
            return null;

        var rows = [];
        var currentRow = [];
        for (var i = 0; i < this.state.result.length; i++) {
            if (i > 0 && i % 5 === 0) {
                rows.push(<div className="video-row">{currentRow}</div>);
                currentRow = [];
            }
            var item = this.state.result[i];
            currentRow.push(<div className="video-item">
                <a href={item.link} target="_blank">
                    <div className="thumbnail"><img src={item.thumbnail} /></div>
                    <span className="title" dangerouslySetInnerHTML={{__html: shorten(fixTitle(item.title), 30)}} />
                </a>
                <span className="date">{formatDate(item.pubDate)}</span>
            </div>);
        }
        if (currentRow.length > 0) {
            rows.push(<div className="video-row">{currentRow}</div>);
        }

        var loadMore;
        if (this.state.isLoading) {
            loadMore = <div className="load-more loading">로드 중...</div>;
        } else if (this.state.hasMore) {
            loadMore = <div className="load-more" onClick={this._loadMore}>검색 결과 더 보기</div>;
        }

        return <div className="section section-video">
            <h2 className="section-title"><i className="fa fa-film" /> 동영상</h2>
            {rows}
            {loadMore}
        </div>;
    }
});

var App = React.createClass({
    render() {
        return <div>
            <GlobalHeader currentUser={PreloadData.current_user} />
            <Router.RouteHandler title={PreloadData.title} />
        </div>;
    }
});

var StatusButton = React.createClass({
    render() {
        var record = this.props.work.record;
        if (record) {
            return <a className="btn-status active"
                href={'/records/' + record.id}>
                <i className="fa fa-pencil" />
                {util.STATUS_TYPE_TEXT[record.status_type]}
                {record.status && <span className="episode">@ {util.getStatusDisplay(record)}</span>}
            </a>;
        } else {
            return <a className="btn-status"
                href={'/records/add/' + encodeURIComponent(this.props.work.title) + '/'}>
                <i className="fa fa-plus" />
                작품 추가
            </a>;
        }
    }
});

var Sidebar = React.createClass({
    render() {
        var metadata = this.props.metadata;
        if (metadata) {
            return <div className="work-sidebar">
                <img className="poster" src={metadata.image_url} />
                <p>
                    <b>{metadata.studios}</b> 제작
                    {metadata.source &&
                        ' / ' + util.SOURCE_TYPE_MAP[metadata.source]}
                </p>
                {metadata.schedule.jp &&
                    <p><i className="fa fa-calendar" /> 첫 방영: {moment(metadata.schedule.jp.date).format('YYYY-MM-DD')}</p>}
                <div className="links">
                {metadata.links.website &&
                    <p><i className="fa fa-globe" /> <a href={metadata.links.website} target="_blank">공식 사이트</a></p>}
                {metadata.links.enha &&
                    <p><i className="fa fa-globe" /> <a href={metadata.links.enha} target="_blank">엔하위키 미러</a></p>}
                {metadata.links.ann &&
                    <p><i className="fa fa-globe" /> <a href={metadata.links.ann} target="_blank">AnimeNewsNetwork (영문)</a></p>}
                </div>
            </div>;
        } else {
            return <div className="work-sidebar">
                <div className="poster poster-empty">No Image</div>
            </div>;
        }
    }
});

var WorkRoute = React.createClass({
    mixins: [Router.State],
    getInitialState() {
        return {work: null};
    },
    componentDidMount() {
        $.get('/api/v2/works/_/' + encodeURIComponent(this.props.title)).then(work => {
            this.setState({work: work});
        });
    },
    render() {
        if (!this.state.work) {
            return <div>
                <h1>{this.props.title}</h1>
            </div>;
        }
        var work = this.state.work;
        return <Layout.Stack>
            <div>
                <Layout.CenteredFullWidth className="work-header">
                    <h1 className="title">{work.title}</h1>
                    <div className="stats">
                        {work.rank &&
                            <span className="stat stat-rank">
                                <i className="fa fa-bar-chart" />
                                전체 {work.rank}위
                            </span>}
                        <span className="stat stat-users">
                            <i className="fa fa-user" />
                            {work.record_count}명이 기록 남김
                        </span>
                    </div>
                    <StatusButton work={work} />
                </Layout.CenteredFullWidth>
                <Grid.Row>
                    <Grid.Column size={9} className="work-content">
                        <div className="episodes">
                            <Router.Link to="work-index" className="recent">최신</Router.Link>
                            {work.episodes.map(ep =>
                                <Router.Link to="work-episode" params={{episode: ep.number}} className={ep.post_count > 0 ? 'has-post' : ''}>{ep.number}화</Router.Link>)}
                        </div>
                        <Router.RouteHandler
                            work={this.state.work}
                            key={this.getParams().episode} />
                    </Grid.Column>
                </Grid.Row>
            </div>
            <Grid.Row>
                <Grid.Column pull="right" size={3}>
                    <Sidebar metadata={work.metadata} />
                </Grid.Column>
            </Grid.Row>
        </Layout.Stack>;
    }
});

var Post = React.createClass({
    render() {
        var post = this.props.post;
        return <div className={React.addons.classSet({'post-item': true})}>
            <div className="meta">
                <a href={'/users/' + post.user.name + '/'} className="user">{post.user.name}</a>
                <i className="fa fa-caret-right separator" />
                <span className="episode">{util.getStatusDisplay(post)}</span>
                <a href={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></a>
            </div>
            <div className="comment">
                {post.comment}
            </div>
        </div>;
    }
});

var WorkIndexRoute = React.createClass({
    mixins: [Router.State],
    getDefaultProps() {
        return {pageSize: 10};
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
        var videoQuery = this.props.work.title;
        if (this.getParams().episode) {
            videoQuery += ' ' + this.getParams().episode + '화';
        }
        return <div>
            <VideoSearchResult query={videoQuery} />
            <div className="section section-post">
                <h2 className="section-title"><i className="fa fa-comment" /> 감상평</h2>
                {this.state.posts.map(post => <Post post={post} />)}
                {loadMore}
            </div>
        </div>;
    },
    _loadMore() {
        this.setState({isLoading: true});
        var params = {count: this.props.pageSize + 1};
        if (this.state.posts.length > 0)
            params.before_id = this.state.posts[this.state.posts.length - 1].id;
        if (this.getParams().episode)
            params.episode = this.getParams().episode;
        $.get('/api/v2/works/' + this.props.work.id + '/posts', params, data => {
            this.setState({
                hasMore: data.length > this.props.pageSize,
                isLoading: false,
                posts: this.state.posts.concat(data)
            });
        });
    }
});

var workPath = '/works/' + encodeURIComponent(PreloadData.title) + '/';
var path = location.pathname;
if (path != workPath) {
    // /works/blahblah/ep/3/ -> /works/blahblah/#/ep/3/
    if (path.indexOf(workPath) === 0)
        path = path.substring(workPath.length);
    location.href = workPath + '#' + path;
}

var {Route, DefaultRoute} = Router;
var workPath = '/';
var routes = (
    <Route handler={App}>
        <Route handler={WorkRoute} path={workPath}>
            <DefaultRoute name="work-index" handler={WorkIndexRoute} />
            <Route name="work-episode" handler={WorkIndexRoute} path={workPath + 'ep/:episode/'} />
        </Route>
    </Route>
);
Router.run(routes, Router.HashLocation, (Handler) => {
    React.render(<Handler />, document.body);
});
