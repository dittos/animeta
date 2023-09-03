import React, { useState } from 'react';
import { AppLayout } from '../layouts/AppLayout';
import * as Grid from '../ui/Grid';
import { LoadMore } from '../ui/LoadMore';
import Styles from './Index.module.less';
import { RouteComponentProps } from '../routes';
import { Post } from '../ui/Post';
import { IndexRouteDocument, IndexRouteQuery, IndexRoute_MoreTimelineDocument } from './__generated__/Index.graphql';
import { WeeklyChart } from '../ui/WeeklyChart';

const Index: React.FC<RouteComponentProps<IndexRouteQuery>> = ({ data, writeData, loader }) => {
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
        {timeline.map(post => <Post key={post!.databaseId} post={post!} />)}
        <LoadMore onClick={_loadMore} isLoading={isLoading} />
      </div>
    );
  }

  async function _loadMore() {
    setIsLoading(true)
    const result = await loader.graphql(IndexRoute_MoreTimelineDocument, {
      timelineBeforeId: data?.timeline?.length ? data.timeline[data.timeline.length - 1]!.databaseId : null,
      count: 32,
    })
    writeData(data => {
      data.timeline = data.timeline!.concat(result.timeline!)
    })
    setIsLoading(false)
  }
}

const routeHandler = AppLayout({ activeMenu: 'home' }).wrap({
  component: Index,

  async load({ loader }) {
    return loader.graphql(IndexRouteDocument, { count: 10 });
  },
});
export default routeHandler;
