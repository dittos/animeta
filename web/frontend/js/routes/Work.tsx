import React from 'react';
import * as WorkViews from '../ui/WorkViews';
import { App } from '../layouts';
import { PostDTO, RecordDTO, UserDTO, WorkDTO } from '../../../shared/types_generated';
import { RouteComponentProps, RouteHandler } from '../routes';
import { WeeklyChartItem } from '../ui/WeeklyChart';
import { PostFetchOptions } from '../../../shared/types';

type WorkRouteData = {
  currentUser: UserDTO | null;
  work: WorkDTO;
  chart: WeeklyChartItem[];
  posts: PostDTO[];
  hasMorePosts: boolean;
  userCount: number;
  suspendedUserCount: number;
  episode: string;
};

type WorkPostsParams = {
  count: number;
  options: PostFetchOptions;
  before_id?: number;
  episode?: string;
  withCounts?: boolean;
};

const POSTS_PER_PAGE = 10;

function Work({ data, writeData, loader }: RouteComponentProps<WorkRouteData>) {
  const { work, chart, episode, posts, hasMorePosts, currentUser, userCount, suspendedUserCount } = data;

  async function loadMorePosts() {
    var params: WorkPostsParams = {
      count: POSTS_PER_PAGE + 1,
      options: {
        user: {},
      },
    };
    if (posts && posts.length > 0)
      params.before_id = posts[posts.length - 1].id;
    if (episode) params.episode = episode;
    const result: PostDTO[] = await loader.callV4(`/works/${work.id}/posts`, params);
    writeData(data => {
      data.posts = data.posts.concat(result.slice(0, POSTS_PER_PAGE));
      data.hasMorePosts = result.length > POSTS_PER_PAGE;
    });
  }

  function applyRecord(record: RecordDTO) {
    writeData(data => {
      data.work.record = record;
    });
  }

  return (
    <WorkViews.Work
      work={work}
      chart={chart}
      currentUser={currentUser}
      onRecordChange={applyRecord}
    >
      <WorkViews.Episodes
        work={work}
        activeEpisodeNumber={episode}
        userCount={userCount}
        suspendedUserCount={suspendedUserCount}
      />
      <WorkViews.WorkIndex
        posts={posts}
        hasMorePosts={hasMorePosts}
        loadMorePosts={loadMorePosts}
      />
    </WorkViews.Work>
  );
}

const routeHandler: RouteHandler<WorkRouteData> = {
  component: App(Work),

  async load({ params, loader }) {
    const { title, episode } = params;
    const [currentUser, work, chart] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.call('/works/by-title', { title }),
      loader.callV4('/charts/works/weekly', { limit: 5 }),
    ]);
    const postsParams: WorkPostsParams = {
      count: POSTS_PER_PAGE + 1,
      withCounts: true,
      options: {
        user: {},
      },
    };
    if (episode) postsParams.episode = episode;
    const { data, userCount, suspendedUserCount } = await loader.callV4(`/works/${work.id}/posts`, postsParams);
    return {
      currentUser,
      work,
      chart,
      posts: data.slice(0, POSTS_PER_PAGE),
      episode,
      hasMorePosts: data.length > POSTS_PER_PAGE,
      userCount,
      suspendedUserCount,
    };
  },

  renderTitle({ work, episode }) {
    var pageTitle = work.title;
    if (episode) {
      pageTitle += ` ${episode}화`;
    }
    return pageTitle;
  },

  renderMeta({ work }) {
    const title = work.title;
    return {
      og_url: `/works/${encodeURIComponent(title)}/`,
      og_type: 'tv_show',
      og_image: work.image_url,
      tw_url: `/works/${encodeURIComponent(title)}/`,
      tw_image: work.image_url,
    };
  },
};
export default routeHandler;
