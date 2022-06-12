import * as React from 'react';
import { Link } from 'nuri';
import * as util from '../util';
import { TimeAgo } from './TimeAgo';
import GqlPostComment from './GqlPostComment';
import Styles from './Post.module.less';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { gql } from '@apollo/client';
import { Post_post } from './__generated__/Post_post';

export function GqlPost({
  post,
  showUser = true,
  showTitle = true,
  showStatusType = false,
  highlighted = false,
}: {
  post: Post_post;
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
            <FontAwesomeIcon icon={faCaretRight} className={Styles.metaSeparator} />
          )}
        {showTitle && (
          <Link to={util.getWorkURL(post.record!.title!)} className={Styles.work}>
            {post.record!.title}
          </Link>
        )}
        {(showStatusType || post.status) && (
          <span className={showTitle ? '' : Styles.episodeWithoutTitle}>
            {showStatusType
              ? util.getStatusTextGql(post)
              : util.getStatusDisplayGql(post)}
          </span>
        )}
        <Link to={util.getPostURLGql(post)} className={Styles.time}>
          {post.updatedAt ? <TimeAgo time={new Date(post.updatedAt)} /> : '#'}
        </Link>
      </div>
      <GqlPostComment post={post} className={Styles.comment} />
    </div>
  );
}

GqlPost.fragments = {
  post: gql`
    ${GqlPostComment.fragments.post}
    fragment Post_post on Post {
      id
      user {
        name
      }
      record {
        title
      }
      statusType
      status
      comment
      updatedAt
      ...PostComment_post
    }
  `
}
