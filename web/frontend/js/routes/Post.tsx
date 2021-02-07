import React from 'react';
import * as WorkViews from '../ui/WorkViews';
import { getStatusDisplay } from '../util';
import { App } from '../layouts';
import { Post as PostComponent } from '../ui/Post';
import { RouteComponentProps, RouteHandler } from '../routes';
import { PostDTO, RecordDTO, UserDTO, WorkDTO } from '../../../shared/types_generated';
import { WeeklyChartItem } from '../ui/WeeklyChart';
import { PostFetchOptions } from '../../../shared/types';

type PostRouteData = {
  currentUser: UserDTO | null;
  post: PostDTO;
  chart: WeeklyChartItem[];
  work: WorkDTO;
  posts?: PostDTO[];
  hasMorePosts?: boolean;
  userCount?: number;
  suspendedUserCount?: number;
};

type PostsParams = {
  count: number;
  options: PostFetchOptions;
  before_id?: number;
  episode?: string;
  withCounts?: boolean;
};

const POSTS_PER_PAGE = 10;

class Post extends React.Component<RouteComponentProps<PostRouteData>> {
  componentDidMount() {
    // lazy load
    this._loadMorePosts();
  }

  componentDidUpdate() {
    if (!this.props.data.posts) {
      this._loadMorePosts();
    }
  }

  render() {
    const { work, chart, posts, hasMorePosts, currentUser, post, userCount, suspendedUserCount } = this.props.data;
    const episode = post.status;
    return (
      <WorkViews.Work
        work={work}
        chart={chart}
        currentUser={currentUser}
        episode={episode}
        onRecordChange={this._applyRecord}
      >
        <WorkViews.Episodes
          work={work}
          activeEpisodeNumber={episode}
          userCount={userCount ?? 0}
          suspendedUserCount={suspendedUserCount ?? 0}
        />
        <PostComponent post={post} showTitle={false} highlighted={true} />
        <WorkViews.WorkIndex
          posts={posts}
          hasMorePosts={hasMorePosts ?? false}
          loadMorePosts={this._loadMorePosts}
          excludePostID={post.id}
        />
      </WorkViews.Work>
    );
  }

  _loadMorePosts = async () => {
    const { work, posts, post } = this.props.data;
    var params: PostsParams = {
      count: POSTS_PER_PAGE + 1,
      episode: post.status,
      options: {
        user: {},
      },
    };
    if (posts && posts.length > 0)
      params.before_id = posts[posts.length - 1].id;
    else
      params.withCounts = true;
    const result = await this.props.loader.call(
      `/works/${work.id}/posts`,
      params
    );
    const posts2 = params.withCounts ? result.data : result;
    this.props.writeData(data => {
      if (!data.posts) data.posts = [];
      data.posts = data.posts.concat(posts2.slice(0, POSTS_PER_PAGE));
      data.hasMorePosts = posts2.length > POSTS_PER_PAGE;
      if (params.withCounts) {
        data.userCount = result.userCount;
        data.suspendedUserCount = result.suspendedUserCount;
      }
    });
  };

  _applyRecord = (record: RecordDTO) => {
    this.props.writeData(data => {
      data.work.record = record;
    });
  };
}

const routeHandler: RouteHandler<PostRouteData> = {
  component: App(Post),

  async load({ params, loader }) {
    const { id } = params;
    const [currentUser, post, chart] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.call(`/posts/${id}`, {
        options: {
          user: {},
          record: {},
        },
      }),
      loader.call('/charts/works/weekly', { limit: 5 }),
    ]);
    const work = await loader.call(`/works/${post.record.work_id}`);
    return {
      currentUser,
      post,
      chart,
      work,
    };
  },

  renderTitle({ post, work }) {
    return `${post.user!.name} 사용자 > ${work.title} ${getStatusDisplay(post)}`;
  },

  renderMeta({ post, work }) {
    return {
      og_url: `/-${post.id}`,
      og_type: 'article',
      og_image: work.image_url,
      tw_url: `/-${post.id}`,
      tw_image: work.image_url,
    };
  },
};
export default routeHandler;
