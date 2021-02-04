import { RouteComponentProps, RouteHandler } from 'nuri/app';
import React from 'react';
import { getUserPosts } from '../API';
import { User } from '../layouts';
import { PostDTO, UserDTO } from '../types_generated';
import * as Layout from '../ui/Layout';
import { LoadMore } from '../ui/LoadMore';
import { Post } from '../ui/Post';
import Styles from './UserHistory.less';

type UserHistoryRouteData = {
  user: UserDTO;
};

function getDateHeader(post: PostDTO) {
  if (!post.updated_at) {
    return '';
  }
  var date = new Date(post.updated_at);
  return date.getFullYear() + '/' + (date.getMonth() + 1);
}

class UserHistory extends React.Component<RouteComponentProps<UserHistoryRouteData>> {
  pageSize = 32;
  state: {
    isLoading: boolean;
    hasMore: boolean;
    posts: PostDTO[];
  } = { isLoading: true, hasMore: true, posts: [] };

  componentDidMount() {
    this._loadMore();
  }

  render() {
    var groups: { key: string; items: PostDTO[]; }[] = [];
    var unknownGroup: PostDTO[] = [];
    var lastKey: string = '', group: PostDTO[] | null = null;
    for (let post of this.state.posts) {
      if (!post.updated_at) {
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
        {this.state.hasMore && (
          <LoadMore isLoading={this.state.isLoading} onClick={this._loadMore} />
        )}
      </Layout.CenteredFullWidth>
    );
  }

  _loadMore = () => {
    this.setState({ isLoading: true });
    var beforeID;
    if (this.state.posts.length > 0)
      beforeID = this.state.posts[this.state.posts.length - 1].id;
    getUserPosts(this.props.data.user.name, this.pageSize, beforeID).then(
      data => {
        this.setState({
          hasMore: data.length >= this.pageSize,
          isLoading: false,
          posts: this.state.posts.concat(data),
        });
      }
    );
  };
}

const routeHandler: RouteHandler<UserHistoryRouteData> = {
  component: User(UserHistory),

  async load({ loader, params }) {
    const { username } = params;
    const [currentUser, user] = await Promise.all([
      loader.getCurrentUser({
        options: {},
      }),
      loader.call(`/users/${encodeURIComponent(username)}`, {
        options: {
          stats: true,
        },
      }),
    ]);
    return {
      currentUser,
      user,
    };
  },

  renderTitle({ user }) {
    return `${user.name} 사용자`;
  },
};
export default routeHandler;
