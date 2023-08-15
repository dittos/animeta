import React, { useEffect } from 'react';
import * as WorkViews from '../ui/WorkViews';
import { getStatusDisplayGql } from '../util';
import { App } from '../layouts';
import { Post as PostComponent } from '../ui/Post';
import { RouteComponentProps, RouteHandler } from '../routes';
import { UserDTO } from '../../../shared/types_generated';
import { PostRouteDocument, PostRouteQuery, PostRoute_PostsDocument, PostRoute_PostsQuery, PostRoute_RefetchDocument } from './__generated__/Post.graphql';
import Styles from './Post.module.less';

type PostRouteData = PostRouteQuery & {
  currentUser: UserDTO | null;
  postsData?: PostRoute_PostsQuery;
};

function Post({ data, writeData, loader }: RouteComponentProps<PostRouteData>) {
  const { post, currentUser, postsData } = data;

  if (!post) return null; // TODO: 404

  const { work, episode } = post;
  
  const postConnection = postsData?.work?.posts;
  const posts = postConnection?.nodes;

  useEffect(() => {
    loadMorePosts()
  }, [post.databaseId])

  async function loadMorePosts() {
    const result = await loader.graphql(PostRoute_PostsDocument, {
      workId: work!.databaseId,
      beforeId: posts?.length ? posts[posts.length - 1]?.databaseId : null,
      episode: episode?.number ?? null,
    })
    writeData(data => {
      if (data.postsData) {
        data.postsData!.work!.posts.nodes = data.postsData!.work!.posts.nodes.concat(result.work!.posts!.nodes);
        data.postsData!.work!.posts.hasMore = result.work!.posts!.hasMore
      } else {
        data.postsData = result
      }
    });
  }

  async function reload() {
    const newData = await loader.graphql(PostRoute_RefetchDocument, { postId: post!.databaseId })
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
      {episode ? <>
        <WorkViews.Episodes
          work={work!}
          activeEpisodeNumber={episode?.number}
        />
        <WorkViews.EpisodeHeader episode={episode} />
        <PostComponent post={post} showTitle={false} highlighted={true} />
        <WorkViews.WorkIndex
          postConnection={postConnection}
          loadMorePosts={loadMorePosts}
          excludePostID={post.databaseId}
        />
      </> : <>
        <div className={Styles.postOnly}>
          <PostComponent post={post} showTitle={false} highlighted={true} />
        </div>
        <WorkViews.Episodes work={work!} />
        <WorkViews.WorkIndex
          postConnection={postConnection}
          loadMorePosts={loadMorePosts}
        />
      </>}
    </WorkViews.Work>
  );
}

const routeHandler: RouteHandler<PostRouteData> = {
  component: App(Post),

  async load({ params, loader }) {
    const { id } = params;
    const [currentUser, data] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.graphql(PostRouteDocument, {postId: id}),
    ]);
    return {
      ...data,
      currentUser,
    };
  },

  renderTitle({ post }) {
    if (!post) return '';
    const { work } = post
    return `${post.user!.name} 사용자 > ${work!.title} ${getStatusDisplayGql(post)}`;
  },

  renderMeta({ post }) {
    if (!post) return {};
    const { work } = post
    return {
      og_url: `/-${post.databaseId}`,
      og_type: 'article',
      og_image: work?.imageUrl,
      tw_url: `/-${post.databaseId}`,
      tw_image: work?.imageUrl,
    };
  },
};
export default routeHandler;
