import * as React from 'react';
import { Link } from 'nuri';
import * as util from '../util';
import TimeAgo from '../ui/TimeAgo';
import PostComment from '../ui/PostComment';
import Styles from './Post.less';

export function Post({ post, showUser = true, showTitle = true, showStatusType = false, highlighted = false }) {
    return (
        <div className={highlighted ? Styles.highlightedPost : Styles.post}>
            <div className="meta">
                {showUser &&
                    <Link to={'/users/' + post.user.name + '/'} className="user">{post.user.name}</Link>}
                {showUser && (showTitle || post.status) &&
                    <i className="fa fa-caret-right separator" />}
                {showTitle &&
                    <Link to={util.getWorkURL(post.record.title)} className="work">{post.record.title}</Link>}
                {(showStatusType || post.status) &&
                    <span className={showTitle ? '' : Styles.episodeWithoutTitle}>
                        {showStatusType ? util.getStatusText(post) : util.getStatusDisplay(post)}
                    </span>}
                <Link to={util.getPostURL(post)} className="time"><TimeAgo time={new Date(post.updated_at)} /></Link>
            </div>
            <PostComment post={post} className="comment" />
        </div>
    );
}
