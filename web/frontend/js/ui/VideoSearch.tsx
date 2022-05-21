import fetch from 'cross-fetch';
import React from 'react';
import { LoadMore } from './LoadMore';
import Styles from './VideoSearch.less';

function formatDate(t: string): string {
  // YYYY-MM-DDTHH:MM:SS+09:00
  var d = new Date(
    parseInt(t.substr(0, 4), 10),
    parseInt(t.substr(5, 2), 10) - 1,
    parseInt(t.substr(8, 2), 10)
  );
  return d.toLocaleDateString();
}

function shorten(str: string, limit: number): string {
  if (str.length > limit) str = str.substring(0, limit - 3) + '...';
  return str;
}

type Props = {
  query: string;
};

function VideoSearch(props: Props) {
  return <VideoSearchInternal key={props.query} {...props} />;
}

class VideoSearchInternal extends React.Component<Props> {
  state = {
    isLoading: true,
    hasMore: true,
    result: [],
    page: 0,
  };

  componentDidMount() {
    this._loadMore();
  }

  _loadMore = () => {
    var page = this.state.page + 1;
    this.setState({ isLoading: true });
    const qs = new URLSearchParams({
      query: this.props.query,
      size: '10',
      page: '' + page,
    })
    fetch('https://dapi.kakao.com/v2/search/vclip?' + qs, {
      headers: {
        'Authorization': `KakaoAK ${window.__nuri.preloadData.kakaoApiKey}`,
        'Content-Type': 'application/json',
      }
    }).then(r => r.json()).then(data => {
      var result = this.state.result.concat(data.documents);
      this.setState({
        hasMore: result.length < data.meta.pageable_count,
        page: page,
        isLoading: false,
        result: result,
      });
    });
  };

  render() {
    const { isLoading, result, page, hasMore } = this.state;
    if (result.length === 0) return null;

    var limit = result.length;
    if (page === 1) {
      limit = Math.min(limit, 5);
    }

    return (
      <div>
        {result.slice(0, limit).map((item: any) => (
          <a href={item.url} target="_blank" className={Styles.item}>
            <div className={Styles.thumbnail}>
              <img src={item.thumbnail} />
            </div>
            <div className={Styles.itemContent}>
              <div className={Styles.title}>{shorten(item.title, 35)}</div>
              <div className={Styles.date}>{formatDate(item.datetime)}</div>
            </div>
          </a>
        ))}
        {hasMore && (
          <LoadMore
            isLoading={isLoading}
            loadMoreText="검색 결과 더 보기"
            onClick={this._loadMore}
          />
        )}
      </div>
    );
  }
}

export default VideoSearch;
