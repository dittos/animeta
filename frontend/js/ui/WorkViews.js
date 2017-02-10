import $ from 'jquery';
import React from 'react';
import cx from 'classnames';
import {Link} from 'nuri';
import {default as dateFnsFormat} from 'date-fns/format';
var TimeAgo = require('./TimeAgo');
import * as Grid from './Grid';
import * as Layout from './Layout';
import * as util from '../util';
import PostComment from './PostComment';
import LoadMore from './LoadMore';
import SpecialWork from './SpecialWork';
import SpecialWorkStatus from './SpecialWorkStatus';
import LoginDialog from './LoginDialog';
import VideoSearch from './VideoSearch';
import WeeklyChart from './WeeklyChart';

function Sidebar({ work, chart }) {
    const metadata = work.metadata;
    return <div className="work-sidebar">
        <div className="hide-mobile">
            {work.image_url ?
                <img className="poster" src={work.image_url} /> :
                <div className="poster poster-empty">No Image</div>}
            {metadata && <div>
                <p>
                    {metadata.studios && <b>{metadata.studios.join(', ')}</b>}
                    {metadata.studios && ' 제작'}
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
            </div>}
        </div>
        <h3 className="section-title">주간 인기 작품</h3>
        <WeeklyChart data={chart} />
    </div>;
}

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

export class Work extends React.Component {
    render() {
        const work = this.props.work;
        return <Grid.Row>
            <Grid.Column size={9} pull="left" className="work-main-container">
                <div className="work-header"
                    style={getCoverImageStyle(work)}>
                    <div className="work-header-special" />
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
                    <SpecialWorkStatus
                        work={work}
                        record={work.record}
                        onInterestedClick={this._markInterested}
                    />
                </div>
                <div className="work-content">
                    {this.props.children}
                </div>
            </Grid.Column>
            <Grid.Column size={3} pull="right">
                <Sidebar work={work}
                    chart={this.props.chart} />
            </Grid.Column>
        </Grid.Row>;
    }

    _markInterested = () => {
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
    };
}

export function Post({ post }) {
    return <div className={cx({'post-item': true})}>
        <div className="meta">
            <a href={'/users/' + post.user.name + '/'} className="user">{post.user.name}</a>
            {post.status &&
                <i className="fa fa-caret-right separator" />}
            {post.status &&
                <span className="episode">{util.getStatusDisplay(post)}</span>}
            <Link to={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></Link>
        </div>
        <PostComment post={post} className="comment" />
    </div>;
}

export class WorkIndex extends React.Component {
    state = {
        isLoading: false,
    };

    render() {
        let {
            work,
            episode,
            posts,
            hasMorePosts,
            excludePostID,
        } = this.props;

        var videoQuery = work.title;
        if (episode) {
            videoQuery += ' ' + episode + '화';
        }
        if (posts && excludePostID) {
            posts = posts.filter(post => post.id !== excludePostID);
        }
        return <div>
            <VideoSearch query={videoQuery} />
            {posts && posts.length > 0 && <div className="section section-post">
                <h2 className="section-title"><i className="fa fa-comment" /> 감상평</h2>
                {posts.map(post => <Post post={post} key={post.id} />)}
                {hasMorePosts &&
                    <LoadMore isLoading={this.state.isLoading} onClick={this._loadMore} />}
            </div>}
        </div>;
    }

    _loadMore = () => {
        this.setState({isLoading: true});
        this.props.loadMorePosts().then(() => {
            this.setState({isLoading: false});
        });
    };
}

export function Episodes({ work, activeEpisodeNumber }) {
    const title = encodeURIComponent(work.title);
    return <div className="episodes">
        <Link to={`/works/${title}/`} className={cx({
            active: !activeEpisodeNumber,
            recent: true
        })}>최신</Link>
        {work.episodes.map(ep =>
            <Link to={`/works/${title}/ep/${ep.number}/`}
                className={cx({
                    'has-post': ep.post_count > 0,
                    'active': ep.number == activeEpisodeNumber
                })}
                key={ep.number}>{ep.number}화</Link>)}
    </div>;
}
