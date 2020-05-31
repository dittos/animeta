import React from 'react';
import * as WorkViews from '../ui/WorkViews';
import { App } from '../layouts';

const POSTS_PER_PAGE = 10;

function Work({ data, writeData, loader }) {
  const { work, chart, episode, posts, hasMorePosts, currentUser, userCount, suspendedUserCount } = data;

  async function loadMorePosts() {
    var params = {
      count: POSTS_PER_PAGE + 1,
      options: {
        user: {},
      },
    };
    if (posts && posts.length > 0)
      params.before_id = posts[posts.length - 1].id;
    if (episode) params.episode = episode;
    const result = await loader.call(`/works/${work.id}/posts`, params);
    writeData(data => {
      data.posts = data.posts.concat(result.slice(0, POSTS_PER_PAGE));
      data.hasMorePosts = result.length > POSTS_PER_PAGE;
    });
  }

  function applyRecord(record) {
    writeData(data => {
      data.work.record = record;
    });
  }

  return (
    <WorkViews.Work
      work={work}
      chart={chart}
      currentUser={currentUser}
      episode={episode}
      onRecordChange={applyRecord}
    >
      <WorkViews.Episodes
        work={work}
        activeEpisodeNumber={episode}
        userCount={userCount}
        suspendedUserCount={suspendedUserCount}
      />
      <WorkViews.WorkIndex
        work={work}
        episode={episode}
        posts={posts}
        hasMorePosts={hasMorePosts}
        loadMorePosts={loadMorePosts}
      />
    </WorkViews.Work>
  );
}

export default {
  component: App(Work),

  async load({ params, loader }) {
    const { title, episode } = params;
    const [currentUser, work, chart] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.call('/works/by-title', { title }),
      loader.call('/charts/works/weekly', { limit: 5 }),
    ]);
    const postsParams = {
      count: POSTS_PER_PAGE + 1,
      withCounts: true,
      options: {
        user: {},
      },
    };
    if (episode) postsParams.episode = episode;
    const { data, userCount, suspendedUserCount } = await loader.call(`/works/${work.id}/posts`, postsParams);
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
      tw_image: work.image_url,
    };
  },
};