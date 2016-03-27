import React from 'react';
import Styles from '../../less/load-more.less';

export default function LoadMore({ isLoading, loadMoreText = '더 보기', onClick }) {
    if (isLoading)
        return <div className={Styles.loadMore}>로드 중...</div>;
    else
        return <div className={Styles.loadMore} onClick={onClick}>{loadMoreText}</div>;
}
