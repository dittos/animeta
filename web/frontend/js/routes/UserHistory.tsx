import { RouteComponentProps } from '../routes';
import React, { useState } from 'react';
import { UserLayout } from '../layouts/UserLayout';
import * as Layout from '../ui/Layout';
import { LoadMore } from '../ui/LoadMore';
import { Post } from '../ui/Post';
import Styles from './UserHistory.module.less';
import { UserHistoryRouteDocument, UserHistoryRouteQuery, UserHistoryRoute_MorePostsDocument } from './__generated__/UserHistory.graphql';
import { Post_PostFragment } from '../ui/__generated__/Post.graphql';

type UserHistoryRouteData = UserHistoryRouteQuery & {
  user: NonNullable<UserHistoryRouteQuery['user']>;
};

function getDateHeader(post: Post_PostFragment) {
  if (!post.updatedAt) {
    return '';
  }
  var date = new Date(post.updatedAt);
  return date.getFullYear() + '/' + (date.getMonth() + 1);
}

function UserHistory({ data, writeData, loader }: RouteComponentProps<UserHistoryRouteData>) {
  const [isLoading, setIsLoading] = useState(false)

  const postConnection = data.user!.posts
  const posts = postConnection.nodes

  var groups: { key: string; items: Post_PostFragment[]; }[] = [];
  var unknownGroup: Post_PostFragment[] = [];
  var lastKey: string = '', group: Post_PostFragment[] | null = null;
  for (let post of posts) {
    if (!post.updatedAt) {
      unknownGroup.push(post);
    } else {
      var key = getDateHeader(post);
      if (key != lastKey) {
        if (group) groups.push({ key: lastKey, items: group });
        lastKey = key;
        group = [];
      }
      if (group) group.push(post);
    }
  }
  if (group && group.length > 0) groups.push({ key: lastKey, items: group });
  if (unknownGroup.length) groups.push({ key: '?', items: unknownGroup });

  async function _loadMore() {
    setIsLoading(true)
    const result = await loader.graphql(UserHistoryRoute_MorePostsDocument, {
      userId: data.user.databaseId,
      beforeId: posts?.length ? posts[posts.length - 1]?.databaseId : null,
    })
    writeData(data => {
      data.user!.posts.nodes = data.user!.posts.nodes.concat(result.user!.posts!.nodes);
      data.user!.posts.hasMore = result.user!.posts!.hasMore
    });
    setIsLoading(false)
  }

  return (
    <Layout.CenteredFullWidth>
      {groups.map(group => (
        <div className={Styles.group}>
          <div className={Styles.groupTitle}>{group.key}</div>
          {group.items.map(post => (
            <Post post={post} showUser={false} showStatusType={true} />
          ))}
        </div>
      ))}
      {postConnection.hasMore && (
        <LoadMore isLoading={isLoading} onClick={_loadMore} />
      )}
    </Layout.CenteredFullWidth>
  );
}

const routeHandler = UserLayout.wrap({
  component: UserHistory,

  async load({ loader, params, notFound }) {
    const { username } = params;
    const {user, ...data} = await loader.graphql(UserHistoryRouteDocument, {username});
    if (!user) {
      return notFound()
    }
    return {
      ...data,
      user,
    };
  },
});
export default routeHandler;
