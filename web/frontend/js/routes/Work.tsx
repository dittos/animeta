import React from 'react';
import * as WorkViews from '../ui/WorkViews';
import { AppLayout } from '../layouts/AppLayout';
import { RouteComponentProps } from '../routes';
import { WorkRouteDocument, WorkRouteQuery, WorkRoute_MorePostsDocument, WorkRoute_RefetchDocument } from './__generated__/Work.graphql';

type WorkRouteData = WorkRouteQuery & {
  work: NonNullable<WorkRouteQuery['work']>;
}

function Work({ data, writeData, loader }: RouteComponentProps<WorkRouteData>) {
  const { work, currentUser } = data;
  const postConnection = work?.posts;
  const posts = postConnection?.nodes;

  async function loadMorePosts() {
    const result = await loader.graphql(WorkRoute_MorePostsDocument, {
      workId: work!.databaseId,
      beforeId: posts?.length ? posts[posts.length - 1]?.databaseId : null,
    })
    writeData(data => {
      data.work!.posts.nodes = data.work!.posts.nodes.concat(result.work!.posts!.nodes);
      data.work!.posts.hasMore = result.work!.posts!.hasMore
    });
  }

  async function reload() {
    const newData = await loader.graphql(WorkRoute_RefetchDocument, { id: work!.databaseId })
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

const routeHandler = AppLayout.wrap({
  component: Work,

  async load({ params, loader, notFound }) {
    const { title } = params;
    const {work, ...data} = await loader.graphql(WorkRouteDocument, { title })
    if (!work) {
      return notFound()
    }
    return {
      ...data,
      work,
    }
  },

  renderTitle({ work }) {
    return work.title!;
  },

  renderMeta({ work }) {
    const title = work.title!;
    return {
      og_url: `/works/${encodeURIComponent(title)}/`,
      og_type: 'tv_show',
      og_image: work.imageUrl,
      tw_url: `/works/${encodeURIComponent(title)}/`,
      tw_image: work.imageUrl,
    };
  },
});
export default routeHandler;
