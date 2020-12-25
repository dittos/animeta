import React, { useEffect, useState } from 'react';
import Styles from './PostComment.less';

type Props = {
  className: string;
  showSpoiler: boolean;
  post: {
    id: number;
    comment: string;
    contains_spoiler: boolean;
  }
};

export default function PostComment(props: Props) {
  const [showSpoiler, setShowSpoiler] = useState(false);

  // Reset showSpoiler state when post ID changes
  useEffect(() => setShowSpoiler(false), [props.post.id]);
  
  const { comment, contains_spoiler } = props.post;
  if (!comment) return null;

  return (
    <div className={props.className}>
      {contains_spoiler &&
      !showSpoiler &&
      !props.showSpoiler ? (
        <span className={Styles.spoilerAlert}>
          <i className="fa fa-microphone-slash" />
          내용 누설 가림
          <span
            className={Styles.revealLink}
            onClick={() => setShowSpoiler(true)}
          >
            보이기
          </span>
        </span>
      ) : (
        comment
      )}
    </div>
  );
}
