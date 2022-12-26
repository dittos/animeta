import * as React from 'react';
import Styles from './LoadMore.less';
import useIntersectionObserver from './useIntersectionObserver';

type LoadMoreProps = {
  isLoading: boolean;
  onClick: () => void;
  loadMoreText?: string;
  innerRef?: React.Ref<HTMLDivElement>;
}

export function LoadMore({
  isLoading,
  onClick,
  loadMoreText = '더 보기',
}: LoadMoreProps) {
  if (isLoading) return <div className={Styles.loadMore}>로드 중...</div>;
  else
    return (
      <div className={Styles.loadMore} onClick={onClick}>
        {loadMoreText}
      </div>
    );
}

export function AutoLoadMore(props: LoadMoreProps & {
  scrollThreshold?: number
}) {
  const sentinelEl = React.useRef<HTMLDivElement | null>(null);
  const entry = useIntersectionObserver(sentinelEl, {
    threshold: [0],
    rootMargin: `0px 0px ${props.scrollThreshold ?? 300}px 0px`,
  });
  const shouldLoadMore = entry ? entry.isIntersecting : false;

  React.useEffect(() => {
    if (shouldLoadMore) {
      props.onClick()
    }
  }, [shouldLoadMore])

  return (
    <div ref={sentinelEl}>
      <LoadMore {...props} />
    </div>
  )
}
