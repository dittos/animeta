import { gql } from '@apollo/client';
import { faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import Styles from './PostComment.less';
import { PostComment_post } from './__generated__/PostComment_post';

type Props = {
  className: string;
  showSpoiler?: boolean;
  post: PostComment_post;
};

export default function GqlPostComment(props: Props) {
  const [showSpoiler, setShowSpoiler] = useState(false);

  // Reset showSpoiler state when post ID changes
  useEffect(() => setShowSpoiler(false), [props.post.id]);
  
  const { comment, containsSpoiler } = props.post;
  if (!comment) return null;

  return (
    <div className={props.className}>
      {containsSpoiler &&
      !showSpoiler &&
      !props.showSpoiler ? (
        <span className={Styles.spoilerAlert}>
          <FontAwesomeIcon icon={faMicrophoneSlash} />
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

GqlPostComment.fragments = {
  post: gql`
    fragment PostComment_post on Post {
      id
      comment
      containsSpoiler
    }
  `
}
