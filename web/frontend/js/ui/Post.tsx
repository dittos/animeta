import * as React from 'react';
import { Link } from 'nuri';
import * as util from '../util';
import { TimeAgo } from './TimeAgo';
import PostComment from './PostComment';
import Styles from './Post.module.less';
import { PostDTO } from '../../../shared/types_generated';

export function Post({
  post,
  showUser = true,
  showTitle = true,
  showStatusType = false,
  highlighted = false,
}: {
  post: PostDTO;
  showUser?: boolean;
  showTitle?: boolean;
  showStatusType?: boolean;
  highlighted?: boolean;
}) {
  return (
    <div className={highlighted ? Styles.highlightedPost : Styles.post}>
      <div className={Styles.meta}>
        {showUser && (
          <Link to={'/users/' + post.user!.name + '/'} className={Styles.user}>
            {post.user!.name}
          </Link>
        )}
        {showUser &&
          (showTitle || post.status) && (
            <i className={`fa fa-caret-right ${Styles.metaSeparator}`} />
          )}
        {showTitle && (
          <Link to={util.getWorkURL(post.record!.title)} className={Styles.work}>
            {post.record!.title}
          </Link>
        )}
        {(showStatusType || post.status) && (
          <span className={showTitle ? '' : Styles.episodeWithoutTitle}>
            {showStatusType
              ? util.getStatusText(post)
              : util.getStatusDisplay(post)}
          </span>
        )}
        <Link to={util.getPostURL(post)} className={Styles.time}>
          {post.updated_at ? <TimeAgo time={new Date(post.updated_at)} /> : '#'}
        </Link>
      </div>
      <PostComment post={post} className={Styles.comment} />
    </div>
  );
}
