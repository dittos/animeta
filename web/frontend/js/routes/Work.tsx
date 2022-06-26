import React from 'react';
import * as WorkViews from '../ui/GqlWorkViews';
import { App } from '../layouts';
import { UserDTO } from '../../../shared/types_generated';
import { RouteComponentProps, RouteHandler } from '../routes';
import { WorkRouteDocument, WorkRouteQuery, WorkRoute_MorePostsDocument, WorkRoute_RefetchDocument } from './__generated__/Work.graphql';

type WorkRouteData = WorkRouteQuery & {
  currentUser: UserDTO | null;
};

function Work({ data, writeData, loader }: RouteComponentProps<WorkRouteData>) {
  const { work, currentUser } = data;
  const postConnection = work?.posts;
  const posts = postConnection?.nodes;

  async function loadMorePosts() {
    const result = await loader.graphql(WorkRoute_MorePostsDocument, {
      workId: work!.id,
      beforeId: posts?.length ? posts[posts.length - 1]?.id : null,
    })
    writeData(data => {
      data.work!.posts.nodes = data.work!.posts.nodes.concat(result.work!.posts!.nodes);
      data.work!.posts.hasMore = result.work!.posts!.hasMore
    });
  }

  async function reload() {
    const newData = await loader.graphql(WorkRoute_RefetchDocument, { id: work!.id })
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
      />
      <WorkViews.WorkIndex
        postConnection={postConnection}
        loadMorePosts={loadMorePosts}
      />
    </WorkViews.Work>
  );
}

const routeHandler: RouteHandler<WorkRouteData> = {
  component: App(Work),

  async load({ params, loader }) {
    const { title } = params;
    const [currentUser, data] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.graphql(WorkRouteDocument, { title }),
    ]);
    return {
      ...data,
      currentUser,
    };
  },

  renderTitle({ work }) {
    return work!.title!;
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
