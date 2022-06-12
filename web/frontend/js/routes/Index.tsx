import React, { useState } from 'react';
import { App } from '../layouts';
import * as Grid from '../ui/Grid';
import WeeklyChart, { WeeklyChartItem } from '../ui/WeeklyChart';
import { LoadMore } from '../ui/LoadMore';
import Styles from './Index.module.less';
import { RouteComponentProps, RouteHandler } from '../routes';
import { UserDTO } from '../../../shared/types_generated';
import { gql, useQuery } from '@apollo/client';
import { IndexRouteQuery, IndexRouteQueryVariables, IndexRouteQuery_timeline } from './__generated__/IndexRouteQuery';
import { GqlPost } from '../ui/GqlPost';

type IndexRouteData = {
  currentUser: UserDTO | null;
  chart: WeeklyChartItem[];
};

const QUERY = gql`
  ${GqlPost.fragments.post}
  query IndexRouteQuery($timelineBeforeId: ID, $count: Int) {
    timeline(beforeId: $timelineBeforeId, count: $count) {
      id
      ...Post_post
    }
  }
`;

const Index: React.FC<RouteComponentProps<IndexRouteData>> = ({ data: _data, writeData, loader }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { data, loading, fetchMore } = useQuery<IndexRouteQuery, IndexRouteQueryVariables>(QUERY, {
    variables: {
      timelineBeforeId: null,
    }
  })

  if (!data) return null

  return (
    <Grid.Row>
      <Grid.Column size={8} pull="left">
        {_renderTimeline(data.timeline!)}
      </Grid.Column>
      <Grid.Column size={4} pull="right" className={Styles.sidebar}>
        <h2 className={Styles.sectionTitle}>주간 인기 작품</h2>
        <WeeklyChart data={_data.chart} />
      </Grid.Column>
    </Grid.Row>
  );

  function _renderTimeline(timeline: (IndexRouteQuery_timeline | null)[]) {
    return (
      <div className={Styles.timeline}>
        <h2 className={Styles.sectionTitle}>최근 감상평</h2>
        {timeline.map(post => <GqlPost key={post!.id} post={post!} />)}
        <LoadMore onClick={_loadMore} isLoading={isLoading} />
      </div>
    );
  }

  async function _loadMore() {
    setIsLoading(true)
    await fetchMore({
      variables: {
        timelineBeforeId: data?.timeline?.length ? data.timeline[data.timeline.length - 1]?.id : null,
        count: 32,
      }
    })
    setIsLoading(false)
  }
}

const routeHandler: RouteHandler<IndexRouteData> = {
  component: App(Index, { activeMenu: 'home' }),

  async load({ loader }) {
    const [currentUser, chart] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.callV4('/charts/works/weekly', { limit: 5 }),
      loader.graphql(QUERY, {count: 10}),
    ]);
    return {
      currentUser,
      chart,
    };
  },
};
export default routeHandler;
