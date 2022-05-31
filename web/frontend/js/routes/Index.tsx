import React, { useState } from 'react';
import { App } from '../layouts';
import * as Grid from '../ui/Grid';
import WeeklyChart, { WeeklyChartItem } from '../ui/WeeklyChart';
import { LoadMore } from '../ui/LoadMore';
import { Post } from '../ui/Post';
import Styles from './Index.module.less';
import { RouteComponentProps, RouteHandler } from '../routes';
import { PostDTO, UserDTO } from '../../../shared/types_generated';

type IndexRouteData = {
  currentUser: UserDTO | null;
  posts: PostDTO[];
  chart: WeeklyChartItem[];
};

const Index: React.FC<RouteComponentProps<IndexRouteData>> = ({ data, writeData, loader }) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Grid.Row>
      <Grid.Column size={8} pull="left">
        {_renderTimeline(data.posts)}
      </Grid.Column>
      <Grid.Column size={4} pull="right" className={Styles.sidebar}>
        <h2 className={Styles.sectionTitle}>주간 인기 작품</h2>
        <WeeklyChart data={data.chart} />
      </Grid.Column>
    </Grid.Row>
  );

  function _renderTimeline(posts: PostDTO[]) {
    return (
      <div className={Styles.timeline}>
        <h2 className={Styles.sectionTitle}>최근 감상평</h2>
        {posts.map(post => <Post key={post.id} post={post} />)}
        <LoadMore onClick={_loadMore} isLoading={isLoading} />
      </div>
    );
  }

  async function _loadMore() {
    setIsLoading(true)
    const result = await loader.callV4('/posts', {
      before_id: data.posts[data.posts.length - 1].id,
      min_record_count: 2,
      options: {
        user: {},
        record: {},
      },
    });
    setIsLoading(false)
    writeData(data => {
      data.posts = data.posts.concat(result);
    });
  }
}

const routeHandler: RouteHandler<IndexRouteData> = {
  component: App(Index, { activeMenu: 'home' }),

  async load({ loader }) {
    const [currentUser, posts, chart] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.callV4('/posts', {
        min_record_count: 2,
        count: 10,
        options: {
          user: {},
          record: {},
        },
      }),
      loader.callV4('/charts/works/weekly', { limit: 5 }),
    ]);
    return {
      currentUser,
      posts,
      chart,
    };
  },
};
export default routeHandler;
