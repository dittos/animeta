/* global PreloadData */
var $ = require('jquery');
var React = require('react');
var cx = require('classnames');
import {Link} from 'nuri';
import {default as dateFnsFormat} from 'date-fns/format';
var TimeAgo = require('./TimeAgo');
var Grid = require('./Grid');
var Layout = require('./Layout');
var WeeklyChart = require('./WeeklyChart');
var util = require('../util');
import PostComment from './PostComment';
import LoadMore from './LoadMore';
import SpecialWork from './SpecialWork';
import SpecialWorkStatus from './SpecialWorkStatus';
import LoginDialog from '../ui/LoginDialog';
// TODO: css module

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
        $.ajax({
            url: 'https://apis.daum.net/search/vclip?callback=?',
            data: {
                apikey: PreloadData.daum_api_key,
                output: 'json',
                result: this.state.itemsPerRow * 2,
                q: this.props.query,
                pageno: page
            },
            dataType: 'jsonp',
            __silent__: true,
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

        return <div className="section section-video">
            <h2 className="section-title"><i className="fa fa-film" /> 동영상</h2>
            {rows}
            <div style={{ clear: 'both' }} />
            {this.state.hasMore &&
                <LoadMore isLoading={this.state.isLoading} loadMoreText="검색 결과 더 보기" onClick={this._loadMore} />}
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
        const work = this.props.work;
        const poster = work.image_url ?
            <img className="poster" src={work.image_url} /> :
            <div className="poster poster-empty">No Image</div>;
        const metadata = work.metadata;
        if (metadata) {
            return <div className="work-sidebar">
                {poster}
                <p>
                    {metadata.studios &&
                        [<b>{metadata.studios.join(', ')}</b>, ' 제작']}
                    {metadata.source &&
                        ' / ' + util.SOURCE_TYPE_MAP[metadata.source]}
                </p>
                {metadata.schedule.jp &&
                    <p><i className="fa fa-calendar" /> 첫 방영: {dateFnsFormat(metadata.schedule.jp.date, 'YYYY-MM-DD')}</p>}
                <div className="links">
                {metadata.links.website &&
                    <p><i className="fa fa-globe" /> <a href={metadata.links.website} target="_blank">공식 사이트</a></p>}
                {metadata.links.namu &&
                    <p><i className="fa fa-globe" /> <a href={metadata.links.namu} target="_blank">나무위키</a></p>}
                {metadata.links.ann &&
                    <p><i className="fa fa-globe" /> <a href={metadata.links.ann} target="_blank">AnimeNewsNetwork (영문)</a></p>}
                </div>
                <h3 className="section-title">주간 인기 작품</h3>
                <WeeklyChart data={this.props.chart} />
            </div>;
        } else {
            return <div className="work-sidebar">
                {poster}
                <h3 className="section-title">주간 인기 작품</h3>
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
    if (work.image_url) {
        return {
            background: (!modernGradientSupported ? '-webkit-' : '') + 'linear-gradient(rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0) 100%),' +
                'url(' + work.image_url + ') 0 40% no-repeat',
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
        const work = this.props.work;
        const isSpecial = util.isSpecialWork(work);
        return <Layout.Stack>
            <div>
                <div className="work-header"
                    style={getCoverImageStyle(work)}>
                    {isSpecial && <div className="work-header-special" />}
                    <Grid.Row>
                        <Grid.Column size={9}>
                            <h1 className="title">{work.title}</h1>
                            <div className="stats">
                                {!isSpecial && work.rank &&
                                    <span className="stat stat-rank">
                                        <i className="fa fa-bar-chart" />
                                        전체 {work.rank}위
                                    </span>}
                                <span className="stat stat-users">
                                    <i className="fa fa-user" />
                                    {work.record_count}명이 기록 남김
                                </span>
                            </div>
                            {isSpecial && !work.record ?
                                <SpecialWorkStatus
                                    work={work}
                                    onInterestedClick={this._markInterested}
                                    onWatchedClick={this._markWatched}
                                /> :
                                <StatusButton work={work} />
                            }
                        </Grid.Column>
                    </Grid.Row>
                </div>
                <Grid.Row>
                    <Grid.Column size={9}
                        className="work-content">
                        {this.props.children}
                        {!this.state.showSidebar &&
                            <h3 className="section-title">주간 인기 작품</h3>}
                        {!this.state.showSidebar &&
                            <WeeklyChart data={this.props.chart} />}
                    </Grid.Column>
                </Grid.Row>
            </div>
            {this.state.showSidebar &&
                <Grid.Row>
                    <Grid.Column pull="right" size={3}>
                        <Sidebar work={work}
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
    },
    _markInterested() {
        const currentUser = this.props.currentUser;

        if (!currentUser) {
            alert('먼저 로그인 해 주세요.');
            LoginDialog.open();
            return;
        }

        $.post(`/api/v2/users/${encodeURIComponent(currentUser.name)}/records`, {
            work_title: this.props.work.title,
            status_type: 'interested',
        }).then(result => {
            this.props.onRecordChange(result.record);
        });
    },
    _markWatched() {
        const currentUser = this.props.currentUser;

        if (!currentUser) {
            alert('먼저 로그인 해 주세요.');
            LoginDialog.open();
            return;
        }

        location.href = `/records/add-simple/${this.props.work.id}/`;
    }
});

var Post = React.createClass({
    render() {
        var post = this.props.post;
        return <div className={cx({'work-post-item': true})}>
            <div className="meta">
                <Link to={'/users/' + post.user.name + '/'} className="user">{post.user.name}</Link>
                {post.status &&
                    <i className="fa fa-caret-right separator" />}
                {post.status &&
                    <span className="episode">{util.getStatusDisplay(post)}</span>}
                <Link to={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></Link>
            </div>
            <PostComment post={post} className="comment" />
        </div>;
    }
});

var WorkIndex = React.createClass({
    getInitialState() {
        return {isLoading: false};
    },
    render() {
        let {
            work,
            episode,
            posts,
            hasMorePosts,
            excludePostID,
        } = this.props;
        const isSpecial = util.isSpecialWork(work);

        var videoQuery = work.title;
        if (episode) {
            videoQuery += ' ' + episode + '화';
        }
        if (posts && excludePostID) {
            posts = posts.filter(post => post.id !== excludePostID);
        }
        return <div>
            {!isSpecial && <VideoSearchResult query={videoQuery} />}
            {isSpecial && <SpecialWork />}
            {posts && posts.length > 0 && <div className="section section-post">
                <h2 className="section-title"><i className="fa fa-comment" /> 감상평</h2>
                {posts.map(post => <Post post={post} key={post.id} />)}
                {hasMorePosts &&
                    <LoadMore isLoading={this.state.isLoading} onClick={this._loadMore} />}
            </div>}
        </div>;
    },
    _loadMore() {
        this.setState({isLoading: true});
        this.props.loadMorePosts().then(() => {
            this.setState({isLoading: false});
        });
    }
});

var Episodes = React.createClass({
    render() {
        const {work} = this.props;
        const title = encodeURIComponent(work.title);
        return <div className="episodes">
            <Link to={`/works/${title}/`} className={cx({
                active: !this.props.activeEpisodeNumber,
                recent: true
            })}>최신</Link>
            {work.episodes.map(ep =>
                <Link to={`/works/${title}/ep/${ep.number}/`}
                    className={cx({
                        'has-post': ep.post_count > 0,
                        'active': ep.number == this.props.activeEpisodeNumber
                    })}
                    key={ep.number}>{ep.number}화</Link>)}
        </div>;
    }
});

module.exports = {
    Post,
    Work,
    WorkIndex,
    Episodes,
};
