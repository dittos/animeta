import React from 'react';
import cx from 'classnames';
import { Link } from 'nuri';
import { default as dateFnsFormat } from 'date-fns/format';
import { filter } from 'rxjs/operators';
import * as Grid from './Grid';
import * as util from '../util';
import { LoadMore } from './LoadMore';
import WorkStatusButton from './WorkStatusButton';
import VideoSearch from './VideoSearch';
import WeeklyChart, { WeeklyChartItem } from './WeeklyChart';
import { Post } from './Post';
import Styles from './WorkViews.less';
import * as Mutations from '../Mutations';
import { PostDTO, RecordDTO, UserDTO, WorkDTO } from '../../../shared/types_generated';
import { Subscription } from 'rxjs';

function Sidebar({ work, chart, episode }: {
  work: WorkDTO;
  chart: WeeklyChartItem[];
  episode?: string;
}) {
  const metadata = work.metadata;
  var videoQuery = work.title;
  if (episode) {
    videoQuery += ' ' + episode + '화';
  }
  return (
    <div className={Styles.sidebar}>
      {metadata && (
        <div className={Styles.metadataSection}>
          <h2 className={Styles.sectionTitle}>작품 정보</h2>
          <div className={Styles.metadata}>
            <p>
              {metadata.studios && <b>{metadata.studios.join(', ')}</b>}
              {metadata.studios && ' 제작'}
              {metadata.source && ' / ' + util.SOURCE_TYPE_MAP[metadata.source]}
            </p>
            {metadata.schedule?.jp?.date && (
              <p>
                <i className="fa fa-calendar" /> 첫 방영:{' '}
                {dateFnsFormat(metadata.schedule.jp.date, 'YYYY-MM-DD')}
              </p>
            )}
            <div className={Styles.metadataLinks}>
              {metadata.links.website && (
                <p>
                  <i className="fa fa-globe" />{' '}
                  <a href={metadata.links.website} target="_blank">
                    공식 사이트
                  </a>
                </p>
              )}
              {metadata.links.namu && (
                <p>
                  <i className="fa fa-globe" />{' '}
                  <a href={metadata.links.namu} target="_blank">
                    나무위키
                  </a>
                </p>
              )}
              {metadata.links.ann && (
                <p>
                  <i className="fa fa-globe" />{' '}
                  <a href={metadata.links.ann} target="_blank">
                    AnimeNewsNetwork (영문)
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={Styles.videosSection}>
        <h2 className={Styles.sectionTitle}>동영상</h2>
        <VideoSearch query={videoQuery} />
      </div>

      <h2 className={Styles.sectionTitle}>주간 인기 작품</h2>
      <WeeklyChart data={chart} />
    </div>
  );
}

export class Work extends React.Component<{
  currentUser: UserDTO | null;
  work: WorkDTO;
  episode?: string;
  chart: WeeklyChartItem[];
  onRecordChange(record: RecordDTO): void;
}> {
  private _subscription: Subscription;

  componentDidMount() {
    // TODO: move subscription up to route
    if (this.props.currentUser) {
      this._subscription = Mutations.records
        .pipe(filter(it => it.work_id === this.props.work.id && it.user_id === this.props.currentUser?.id))
        .subscribe(it => {
          this.props.onRecordChange(it);
        });
    }
  }

  componentWillUnmount() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  render() {
    const work = this.props.work;
    return (
      <div className={Styles.container}>
        <Grid.Row>
          <Grid.Column size={8} pull="left">
            <div className={Styles.main}>
              {this._renderHeader()}
              <div className={Styles.content}>{this.props.children}</div>
            </div>
          </Grid.Column>
          <Grid.Column size={4} pull="right">
            <Sidebar
              work={work}
              episode={this.props.episode}
              chart={this.props.chart}
            />
          </Grid.Column>
        </Grid.Row>
      </div>
    );
  }

  _renderHeader() {
    const work = this.props.work;
    return (
      <div className={Styles.header}>
        {work.image_url && (
          <div className={Styles.poster}>
            <img className={Styles.posterImage} src={work.image_url} />
          </div>
        )}
        <div
          className={
            work.image_url
              ? Styles.headerContentWithPoster
              : Styles.headerContent
          }
        >
          <h1 className={Styles.title}>{work.title}</h1>
          <div className={Styles.stats}>
            <span className={Styles.userStat}>
              <i className="fa fa-user" />
              {work.record_count}명이 기록 남김
            </span>
          </div>
          <WorkStatusButton
            work={work}
            record={work.record}
            currentUser={this.props.currentUser}
          />
        </div>
      </div>
    );
  }
}

export class WorkIndex extends React.Component<{
  posts?: PostDTO[];
  hasMorePosts: boolean;
  excludePostID?: number;
  loadMorePosts(): Promise<void>;
}> {
  state = {
    isLoading: false,
  };

  render() {
    let { posts, hasMorePosts, excludePostID } = this.props;

    if (posts && excludePostID) {
      posts = posts.filter(post => post.id !== excludePostID);
    }
    return posts && posts.length > 0 ? (
      <div className={Styles.postsSection}>
        {posts.map(post => (
          <Post key={post.id} post={post} showTitle={false} />
        ))}
        {hasMorePosts && (
          <LoadMore
            isLoading={this.state.isLoading}
            onClick={this._loadMore}
          />
        )}
      </div>
    ) : null;
  }

  _loadMore = () => {
    this.setState({ isLoading: true });
    this.props.loadMorePosts().then(() => {
      this.setState({ isLoading: false });
    });
  };
}

export function Episodes({ work, activeEpisodeNumber, userCount, suspendedUserCount }: {
  work: WorkDTO;
  activeEpisodeNumber: string;
  userCount: number;
  suspendedUserCount: number;
}) {
  const title = encodeURIComponent(work.title);
  const activeEpisode = activeEpisodeNumber && work.episodes!.filter(it => String(it.number) === activeEpisodeNumber)[0];
  return <>
    <div className={Styles.episodes}>
      <Link
        to={`/works/${title}/`}
        className={cx({
          active: !activeEpisodeNumber,
          recent: true,
        })}
      >
        최신
      </Link>
      {work.episodes!.map(ep => (
        <Link
          to={`/works/${title}/ep/${ep.number}/`}
          className={cx({
            'has-post': (ep.post_count ?? 0) > 0,
            active: String(ep.number) === activeEpisodeNumber,
          })}
          key={ep.number}
        >
          {ep.number}화
        </Link>
      ))}
    </div>
    {activeEpisodeNumber && (
      <div className={Styles.episodeHeader}>
        <h2 className={Styles.sectionTitle}>{activeEpisodeNumber}화</h2>
        <div className={Styles.episodeStats}>
          <span>
            <i className="fa fa-comment" />
            감상평 {activeEpisode ? activeEpisode.post_count : 0}개
          </span>
          <span>
            <i className="fa fa-user" />
            {userCount}명 기록 {suspendedUserCount > 0 && ` (${suspendedUserCount}명 중단)`}
          </span>
        </div>
      </div>
    )}
  </>;
}
