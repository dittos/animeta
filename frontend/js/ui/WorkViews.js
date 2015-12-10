/* global PreloadData */
var $ = require('jquery');
var React = require('react');
var cx = require('classnames');
var moment = require('moment');
var {Link} = require('react-router');
var TimeAgo = require('./TimeAgo');
var Grid = require('./Grid');
var Layout = require('./Layout');
var WeeklyChart = require('./WeeklyChart');
var util = require('../util');

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
        return {
            itemsPerRow: 5,
            isLoading: true,
            hasMore: true,
            result: []
        };
    },

    componentDidMount() {
        $(window).on('resize', this._onResize);
        this._relayout(() => this._loadMore());
    },

    componentWillUnmount() {
        $(window).off('resize', this._onResize);
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
            result: this.state.itemsPerRow * 2,
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
            });
        });
    },

    render() {
        if (!this.state.isLoading && this.state.result.length === 0)
            return null;

        var rows = [];
        var currentRow = [];
        var limit = this.state.result.length;
        if (this.state.page === 1)
            limit = Math.min(limit, this.state.itemsPerRow);
        for (var i = 0; i < limit; i++) {
            if (i > 0 && i % this.state.itemsPerRow === 0) {
                rows.push(<div className="video-row">{currentRow}</div>);
                currentRow = [];
            }
            var item = this.state.result[i];
            currentRow.push(<div className="video-item"
                style={{width: (100 / this.state.itemsPerRow) + '%'}}>
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
    },

    _onResize() {
        this._relayout();
    },

    _relayout(cb) {
        var width = $(window).width();
        if (width <= 768)
            this.setState({itemsPerRow: 3}, cb);
        else if (width <= 960)
            this.setState({itemsPerRow: 4}, cb);
        else
            this.setState({itemsPerRow: 5}, cb);
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
                    <b>{metadata.studios.join(', ')}</b> 제작
                    {metadata.source &&
                        ' / ' + util.SOURCE_TYPE_MAP[metadata.source]}
                </p>
                {metadata.schedule.jp &&
                    <p><i className="fa fa-calendar" /> 첫 방영: {moment(metadata.schedule.jp.date).format('YYYY-MM-DD')}</p>}
                <div className="links">
                {metadata.links.website &&
                    <p><i className="fa fa-globe" /> <a href={metadata.links.website} target="_blank">공식 사이트</a></p>}
                {metadata.links.namu &&
                    <p><i className="fa fa-globe" /> <a href={metadata.links.namu} target="_blank">나무위키</a></p>}
                {metadata.links.ann &&
                    <p><i className="fa fa-globe" /> <a href={metadata.links.ann} target="_blank">AnimeNewsNetwork (영문)</a></p>}
                </div>
                <WeeklyChart data={this.props.chart} />
            </div>;
        } else {
            return <div className="work-sidebar">
                <div className="poster poster-empty">No Image</div>
                <WeeklyChart data={this.props.chart} />
            </div>;
        }
    }
});

var modernGradientSupported = (() => {
    if (!process.env.CLIENT)
        return true;
    var el = document.createElement('div');
    el.style.cssText = 'background-image: linear-gradient(white,white);';
    return ('' + el.style.backgroundImage).indexOf('gradient') > -1;
})();

function getCoverImageStyle(work) {
    if (work.metadata && work.metadata.image_url) {
        return {
            background: (!modernGradientSupported ? '-webkit-' : '') + 'linear-gradient(rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0) 100%),' +
                'url(' + work.metadata.image_url + ') 0 40% no-repeat',
            backgroundSize: 'cover'
        };
    }
    return {};
}

var Work = React.createClass({
    getInitialState() {
        return {showSidebar: true};
    },
    componentDidMount() {
        this._relayout();
        $(window).on('resize', this._relayout);
    },
    componentWillUnmount() {
        $(window).off('resize', this._relayout);
    },
    render() {
        var work = this.props.work;
        return <Layout.Stack>
            <div>
                <div className="work-header"
                    style={getCoverImageStyle(work)}>
                    <Grid.Row>
                        <Grid.Column size={9}>
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
                        </Grid.Column>
                    </Grid.Row>
                </div>
                <Grid.Row>
                    <Grid.Column size={9}
                        className="work-content">
                        {this.props.children}
                        {!this.state.showSidebar &&
                            <WeeklyChart data={this.props.chart} />}
                    </Grid.Column>
                </Grid.Row>
            </div>
            {this.state.showSidebar &&
                <Grid.Row>
                    <Grid.Column pull="right" size={3}>
                        <Sidebar metadata={work.metadata}
                            chart={this.props.chart} />
                    </Grid.Column>
                </Grid.Row>}
        </Layout.Stack>;
    },
    _relayout() {
        var width = $(window).width();
        var nextState = {showSidebar: width > 480};
        if (this.state.showSidebar != nextState.showSidebar)
            this.setState(nextState);
    }
});

var Post = React.createClass({
    render() {
        var post = this.props.post;
        return <div className={cx({'post-item': true})}>
            <div className="meta">
                <a href={'/users/' + post.user.name + '/'} className="user">{post.user.name}</a>
                {post.status &&
                    <i className="fa fa-caret-right separator" />}
                {post.status &&
                    <span className="episode">{util.getStatusDisplay(post)}</span>}
                <Link to={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></Link>
            </div>
            <div className="comment">
                {post.comment}
            </div>
        </div>;
    }
});

var WorkIndex = React.createClass({
    getDefaultProps() {
        return {pageSize: 10};
    },
    getInitialState() {
        return {isLoading: false, hasMore: this.props.hasMore, posts: this.props.initialPosts};
    },
    componentDidMount() {
        if (!this.state.posts) {
            this._loadMore();
        }
    },
    render() {
        var loadMore;
        if (this.state.isLoading) {
            loadMore = <div className="load-more loading">로드 중...</div>;
        } else if (this.state.hasMore) {
            loadMore = <div className="load-more" onClick={this._loadMore}>더 보기</div>;
        }
        var videoQuery = this.props.work.title;
        if (this.props.episode) {
            videoQuery += ' ' + this.props.episode + '화';
        }
        var posts = this.state.posts;
        if (posts && this.props.excludePostID) {
            posts = posts.filter(post => post.id != this.props.excludePostID);
        }
        return <div>
            <VideoSearchResult query={videoQuery} />
            {posts && posts.length > 0 && <div className="section section-post">
                <h2 className="section-title"><i className="fa fa-comment" /> 감상평</h2>
                {posts.map(post => <Post post={post} key={post.id} />)}
                {loadMore}
            </div>}
        </div>;
    },
    _loadMore() {
        this.setState({isLoading: true});
        var params = {count: this.props.pageSize + 1};
        if (this.state.posts && this.state.posts.length > 0)
            params.before_id = this.state.posts[this.state.posts.length - 1].id;
        if (this.props.episode)
            params.episode = this.props.episode;
        $.get('/api/v2/works/' + this.props.work.id + '/posts', params, data => {
            this.setState({
                hasMore: data.length > this.props.pageSize,
                isLoading: false,
                posts: (this.state.posts || []).concat(data)
            });
        });
    }
});

module.exports = {
    Post,
    Work,
    WorkIndex
};
