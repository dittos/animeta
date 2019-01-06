/* global PreloadData */
import $ from 'jquery';
import React from 'react';
import { LoadMore } from './LoadMore';
import Styles from './VideoSearch.less';

function formatDate(t) {
  // YYYY-MM-DDTHH:MM:SS+09:00
  var d = new Date(
    parseInt(t.substr(0, 4), 10),
    parseInt(t.substr(5, 2), 10) - 1,
    parseInt(t.substr(8, 2), 10)
  );
  return d.toLocaleDateString();
}

function shorten(str, limit) {
  if (str.length > limit) str = str.substring(0, limit - 3) + '...';
  return str;
}

class VideoSearch extends React.Component {
  state = {
    isLoading: true,
    hasMore: true,
    result: [],
    page: 0,
  };

  componentDidMount() {
    this._loadMore();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.query != nextProps.query) {
      this.setState(
        {
          isLoading: true,
          hasMore: true,
          result: [],
          page: 0,
        },
        this._loadMore
      );
    }
  }

  _loadMore = () => {
    var page = this.state.page + 1;
    this.setState({ isLoading: true });
    $.ajax({
      url: 'https://dapi.kakao.com/v2/search/vclip',
      headers: {
        'Authorization': `KakaoAK ${PreloadData.kakaoApiKey}`,
      },
      data: {
        query: this.props.query,
        size: 10,
        page: page,
      },
      __silent__: true,
    }).then(data => {
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
        {result.slice(0, limit).map(item => (
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
