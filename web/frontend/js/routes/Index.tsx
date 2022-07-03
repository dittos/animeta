import React, { useState } from 'react';
import { App } from '../layouts';
import * as Grid from '../ui/Grid';
import { LoadMore } from '../ui/LoadMore';
import Styles from './Index.module.less';
import { RouteComponentProps, RouteHandler } from '../routes';
import { UserDTO } from '../../../shared/types_generated';
import { Post } from '../ui/Post';
import { IndexRouteDocument, IndexRouteQuery, IndexRoute_MoreTimelineDocument } from './__generated__/Index.graphql';
import { WeeklyChart } from '../ui/WeeklyChart';

type IndexRouteData = IndexRouteQuery & {
  currentUser: UserDTO | null;
};

const Index: React.FC<RouteComponentProps<IndexRouteData>> = ({ data, writeData, loader }) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Grid.Row>
      <Grid.Column size={8} pull="left">
        {_renderTimeline(data.timeline!)}
      </Grid.Column>
      <Grid.Column size={4} pull="right" className={Styles.sidebar}>
        <h2 className={Styles.sectionTitle}>주간 인기 작품</h2>
        <WeeklyChart data={data} />
      </Grid.Column>
    </Grid.Row>
  );

  function _renderTimeline(timeline: NonNullable<IndexRouteQuery['timeline']>) {
    return (
      <div className={Styles.timeline}>
        <h2 className={Styles.sectionTitle}>최근 감상평</h2>
        {timeline.map(post => <Post key={post!.id} post={post!} />)}
        <LoadMore onClick={_loadMore} isLoading={isLoading} />
      </div>
    );
  }

  async function _loadMore() {
    setIsLoading(true)
    const result = await loader.graphql(IndexRoute_MoreTimelineDocument, {
      timelineBeforeId: data?.timeline?.length ? data.timeline[data.timeline.length - 1]!.id : null,
      count: 32,
    })
    writeData(data => {
      data.timeline = data.timeline!.concat(result.timeline!)
    })
    setIsLoading(false)
  }
}

const routeHandler: RouteHandler<IndexRouteData> = {
  component: App(Index, { activeMenu: 'home' }),

  async load({ loader }) {
    const [currentUser, data] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.graphql(IndexRouteDocument, { count: 10 }),
    ]);
    return {
      ...data,
      currentUser,
    };
  },
};
export default routeHandler;
