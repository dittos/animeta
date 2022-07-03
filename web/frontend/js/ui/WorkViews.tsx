import React from 'react';
import cx from 'classnames';
import { Link } from 'nuri';
import { default as dateFnsFormat } from 'date-fns/format';
import { filter } from 'rxjs/operators';
import * as Grid from './Grid';
import * as util from '../util';
import { LoadMore } from './LoadMore';
import { WorkStatusButton } from './WorkStatusButton';
import VideoSearch from './VideoSearch';
import Styles from './WorkViews.less';
import * as Mutations from '../Mutations';
import { UserDTO } from '../../../shared/types_generated';
import { Subscription } from 'rxjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faComment, faExternalLink, faUser } from '@fortawesome/free-solid-svg-icons';
import { WorkViewsFragment, WorkViews_EpisodeFragment, WorkViews_PostConnectionFragment } from './__generated__/WorkViews.graphql';
import { WeeklyChart } from './WeeklyChart';
import { WeeklyChartFragment } from './__generated__/WeeklyChart.graphql';
import { GqlPost } from './GqlPost';

function Sidebar({ work, chart, episode }: {
  work: WorkViewsFragment;
  chart: WeeklyChartFragment;
  episode?: string;
}) {
  const metadata = work.metadata;
  var videoQuery = work.title!;
  if (episode) {
    videoQuery += ' ' + episode + '화';
  }
  const jpSchedule = metadata?.schedules?.find(it => it.country === 'jp')
  return (
    <div className={Styles.sidebar}>
      {metadata && (
        <div className={Styles.metadataSection}>
          <h2 className={Styles.sectionTitle}>작품 정보</h2>
          <div className={Styles.metadata}>
            <p>
              {metadata.studioNames && <b>{metadata.studioNames.join(', ')}</b>}
              {metadata.studioNames && ' 제작'}
              {metadata.source && (' / ' + util.SOURCE_TYPE_MAP[metadata.source])}
            </p>
            {jpSchedule?.date && (
              <p>
                <FontAwesomeIcon icon={faCalendarAlt} /> 첫 방영:{' '}
                {dateFnsFormat(jpSchedule.date, 'YYYY-MM-DD')}
              </p>
            )}
            <div className={Styles.metadataLinks}>
              {metadata.websiteUrl && (
                <p>
                  <FontAwesomeIcon icon={faExternalLink} /> {' '}
                  <a href={metadata.websiteUrl} target="_blank">
                    공식 사이트
                  </a>
                </p>
              )}
              {metadata.namuwikiUrl && (
                <p>
                  <FontAwesomeIcon icon={faExternalLink} /> {' '}
                  <a href={metadata.namuwikiUrl} target="_blank">
                    나무위키
                  </a>
                </p>
              )}
              {metadata.annUrl && (
                <p>
                  <FontAwesomeIcon icon={faExternalLink} /> {' '}
                  <a href={metadata.annUrl} target="_blank">
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
  work: WorkViewsFragment;
  episode?: string;
  chart: WeeklyChartFragment;
  onRecordChange(recordId: number): void;
}> {
  private _subscription: Subscription;

  componentDidMount() {
    // TODO: move subscription up to route
    if (this.props.currentUser) {
      this._subscription = Mutations.records
        .pipe(filter(it => it.work_id.toString() === this.props.work.id && it.user_id === this.props.currentUser?.id))
        .subscribe(it => {
          this.props.onRecordChange(it.id);
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
        {work.imageUrl && (
          <div className={Styles.poster}>
            <img className={Styles.posterImage} src={work.imageUrl} />
          </div>
        )}
        <div
          className={
            work.imageUrl
              ? Styles.headerContentWithPoster
              : Styles.headerContent
          }
        >
          <h1 className={Styles.title}>{work.title}</h1>
          <div className={Styles.stats}>
            <span className={Styles.userStat}>
              <FontAwesomeIcon icon={faUser} />
              {work.recordCount}명이 기록 남김
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
  postConnection?: WorkViews_PostConnectionFragment;
  excludePostID?: string;
  loadMorePosts(): Promise<void>;
}> {
  state = {
    isLoading: false,
  };

  render() {
    const { postConnection, excludePostID } = this.props;

    let posts = postConnection?.nodes;
    const hasMorePosts = postConnection?.hasMore;

    if (posts && excludePostID) {
      posts = posts.filter(post => post.id !== excludePostID);
    }
    return posts && posts.length > 0 ? (
      <div className={Styles.postsSection}>
        {posts.map(post => (
          <GqlPost key={post.id} post={post} showTitle={false} />
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

export function Episodes({ work, activeEpisodeNumber }: {
  work: WorkViewsFragment;
  activeEpisodeNumber?: number | null;
}) {
  const title = encodeURIComponent(work.title!);
  return (
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
            'has-post': (ep.postCount ?? 0) > 0,
            active: ep.number === activeEpisodeNumber,
          })}
          key={ep.number}
        >
          {ep.number}화
        </Link>
      ))}
    </div>
  );
}

export function EpisodeHeader({ episode }: {
  episode: WorkViews_EpisodeFragment;
}) {
  return (
    <div className={Styles.episodeHeader}>
      <h2 className={Styles.sectionTitle}>{util.formatStatus(episode.number)}</h2>
      <div className={Styles.episodeStats}>
        <span>
          <FontAwesomeIcon icon={faComment} />
          감상평 {episode.postCount ?? 0}개
        </span>
        <span>
          <FontAwesomeIcon icon={faUser} />
          {episode.userCount}명 기록 {episode.suspendedUserCount != null && episode.suspendedUserCount > 0 && ` (${episode.suspendedUserCount}명 중단)`}
        </span>
      </div>
    </div>
  );
}
