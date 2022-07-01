import React from 'react';
import * as WorkViews from '../ui/GqlWorkViews';
import { App } from '../layouts';
import { UserDTO } from '../../../shared/types_generated';
import { RouteComponentProps, RouteHandler } from '../routes';
import { WorkEpisodeRouteDocument, WorkEpisodeRouteQuery, WorkEpisodeRoute_MorePostsDocument, WorkEpisodeRoute_RefetchDocument } from './__generated__/WorkEpisode.graphql';

type WorkEpisodeRouteData = WorkEpisodeRouteQuery & {
  currentUser: UserDTO | null;
};

function WorkEpisode({ data, writeData, loader }: RouteComponentProps<WorkEpisodeRouteData>) {
  const { work, currentUser } = data;
  const episode = work?.episode;

  if (!episode) return null; // TODO: 404

  const postConnection = work?.posts;
  const posts = postConnection?.nodes;

  async function loadMorePosts() {
    const result = await loader.graphql(WorkEpisodeRoute_MorePostsDocument, {
      workId: work!.id,
      beforeId: posts?.length ? posts[posts.length - 1]?.id : null,
      episode: episode!.number,
    })
    writeData(data => {
      data.work!.posts.nodes = data.work!.posts.nodes.concat(result.work!.posts!.nodes);
      data.work!.posts.hasMore = result.work!.posts!.hasMore
    });
  }

  async function reload() {
    const newData = await loader.graphql(WorkEpisodeRoute_RefetchDocument, { id: work!.id, episode: episode!.number })
    writeData(data => {
      Object.assign(data, newData)
    });
  }

  return (
    <WorkViews.Work
      work={work!}
      chart={data}
      currentUser={currentUser}
      onRecordChange={reload}
    >
      <WorkViews.Episodes
        work={work!}
        activeEpisodeNumber={episode.number}
      />
      <WorkViews.EpisodeHeader episode={episode} />
      <WorkViews.WorkIndex
        postConnection={postConnection}
        loadMorePosts={loadMorePosts}
      />
    </WorkViews.Work>
  );
}

const routeHandler: RouteHandler<WorkEpisodeRouteData> = {
  component: App(WorkEpisode),

  async load({ params, loader }) {
    const { title, episode: _episode } = params;
    const episode = Number(_episode)
    const [currentUser, data] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.graphql(WorkEpisodeRouteDocument, { title, episode }),
    ]);
    return {
      ...data,
      currentUser,
    };
  },

  renderTitle({ work }) {
    return `${work!.title} ${work!.episode!.number}화`;
  },

  renderMeta({ work }) {
    if (!work) return {};
    const title = work.title!;
    return {
      og_url: `/works/${encodeURIComponent(title)}/`,
      og_type: 'tv_show',
      og_image: work.imageUrl,
      tw_url: `/works/${encodeURIComponent(title)}/`,
      tw_image: work.imageUrl,
    };
  },
};
export default routeHandler;
