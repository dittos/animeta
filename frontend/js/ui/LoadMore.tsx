import * as React from 'react';
import Styles from './LoadMore.less';

export function LoadMore({
  isLoading,
  onClick,
  loadMoreText = '더 보기',
}: {
  isLoading: boolean;
  onClick: React.MouseEventHandler<any>;
  loadMoreText?: string;
}) {
  if (isLoading) return <div className={Styles.loadMore}>로드 중...</div>;
  else
    return (
      <div className={Styles.loadMore} onClick={onClick}>
        {loadMoreText}
      </div>
    );
}
