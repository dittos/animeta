import React from 'react';
import Styles from './LoadMore.less';

export default function LoadMore({ isLoading, onClick, loadMoreText = '더 보기' }) {
    if (isLoading)
        return <div className={Styles.loadMore}>로드 중...</div>;
    else
        return <div className={Styles.loadMore} onClick={onClick}>{loadMoreText}</div>;
}
