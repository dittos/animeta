import React from 'react';
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

class Index extends React.Component<RouteComponentProps<IndexRouteData>> {
  state = {
    isLoading: false,
  };

  render() {
    return (
      <Grid.Row>
        <Grid.Column size={8} pull="left">
          {this._renderTimeline(this.props.data.posts)}
        </Grid.Column>
        <Grid.Column size={4} pull="right" className={Styles.sidebar}>
          <h2 className={Styles.sectionTitle}>주간 인기 작품</h2>
          <WeeklyChart data={this.props.data.chart} />
        </Grid.Column>
      </Grid.Row>
    );
  }

  _renderTimeline(posts: PostDTO[]) {
    return (
      <div className={Styles.timeline}>
        <h2 className={Styles.sectionTitle}>최근 감상평</h2>
        {posts.map(post => <Post key={post.id} post={post} />)}
        <LoadMore onClick={this._loadMore} isLoading={this.state.isLoading} />
      </div>
    );
  }

  _loadMore = async () => {
    this.setState({ isLoading: true });
    const result = await this.props.loader.call('/posts', {
      before_id: this.props.data.posts[this.props.data.posts.length - 1].id,
      min_record_count: 2,
      options: {
        user: {},
        record: {},
      },
    });
    this.setState({
      isLoading: false,
    });
    this.props.writeData(data => {
      data.posts = data.posts.concat(result);
    });
  };
}

const routeHandler: RouteHandler<IndexRouteData> = {
  component: App(Index, { activeMenu: 'home' }),

  async load({ loader }) {
    const [currentUser, posts, chart] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.call('/posts', {
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
