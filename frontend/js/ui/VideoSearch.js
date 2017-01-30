/* global PreloadData */
import $ from 'jquery';
import React from 'react';
import LoadMore from './LoadMore';
import Styles from './VideoSearch.less';

function fixTitle(title) {
    // &lt;b&gt;...&lt;b&gt; -> <b>...</b>
    return $('<span />').html(title.replace(/&lt;(\/?b)&gt;/g, "<$1>")).text();
}

function formatDate(t) {
    // YYYYMMDDHHMMSS
    var d = new Date(parseInt(t.substr(0,4), 10), parseInt(t.substr(4,2), 10) - 1, parseInt(t.substr(6,2), 10));
    return d.toLocaleDateString();
}

function shorten(str, limit) {
    if (str.length > limit)
        str = str.substring(0, limit - 3) + '...';
    return str;
}

function Grid({ items, itemsPerRow, spacing, createItemElement }) {
    const rows = [];
    let currentRow = [];
    const rowWrapperStyle = {
        clear: 'both',
        marginLeft: -spacing + 'px',
        marginBottom: spacing + 'px',
        overflow: 'hidden', // height
    };
    const itemWrapperStyle = {
        'float': 'left',
        width: (100 / itemsPerRow) + '%',
        boxSizing: 'border-box',
        paddingLeft: spacing + 'px',
    };
    for (var i = 0; i < items.length; i++) {
        if (i > 0 && i % itemsPerRow === 0) {
            rows.push(
                <div style={rowWrapperStyle} key={i}>{currentRow}</div>
            );
            currentRow = [];
        }
        currentRow.push(
            <div style={itemWrapperStyle} key={i}>
                {createItemElement(items[i])}
            </div>
        );
    }
    if (currentRow.length > 0) {
        rows.push(
            <div style={rowWrapperStyle} key="last">{currentRow}</div>
        );
    }
    return <div>
        {rows}
        <div style={{clear: 'both'}} />
    </div>;
}

class VideoSearch extends React.Component {
    state = {
        itemsPerRow: 5,
        isLoading: true,
        hasMore: true,
        result: [],
        page: 0,
    };

    componentDidMount() {
        $(window).on('resize', this._onResize);
        this._relayout(() => this._loadMore());
    }

    componentWillUnmount() {
        $(window).off('resize', this._onResize);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.query != nextProps.query) {
            this.setState({
                isLoading: true,
                hasMore: true,
                result: [],
                page: 0,
            }, this._loadMore);
        }
    }

    _loadMore = () => {
        var page = this.state.page + 1;
        this.setState({isLoading: true});
        $.ajax({
            url: 'https://apis.daum.net/search/vclip?callback=?',
            data: {
                apikey: PreloadData.daum_api_key,
                output: 'json',
                result: this.state.itemsPerRow * 2,
                q: this.props.query,
                pageno: page
            },
            dataType: 'jsonp',
            __silent__: true,
        }).then(data => {
            var result = this.state.result.concat(data.channel.item);
            var totalCount = parseInt(data.channel.totalCount, 10);
            this.setState({
                hasMore: result.length < totalCount,
                page: page,
                isLoading: false,
                result: result
            });
        });
    };

    render() {
        const {
            isLoading,
            result,
            page,
            itemsPerRow,
            hasMore,
        } = this.state;
        if (result.length === 0)
            return null;

        var limit = result.length;
        if (page === 1) {
            limit = Math.min(limit, itemsPerRow);
        }

        // TODO: css modules
        return <div className="section section-video">
            <h2 className="section-title">
                <i className="fa fa-film" /> 동영상
            </h2>
            <Grid
                items={result.slice(0, limit)}
                itemsPerRow={itemsPerRow}
                spacing={10}
                createItemElement={item => (
                    <div className={Styles.item}>
                        <a href={item.link} target="_blank">
                            <div className={Styles.thumbnail}>
                                <img src={item.thumbnail} />
                            </div>
                            <div className={Styles.title} dangerouslySetInnerHTML={{__html: shorten(fixTitle(item.title), 30)}} />
                        </a>
                        <div className={Styles.date}>{formatDate(item.pubDate)}</div>
                    </div>
                )}
            />
            {hasMore &&
                <LoadMore
                    isLoading={isLoading}
                    loadMoreText="검색 결과 더 보기"
                    onClick={this._loadMore}
                />}
        </div>;
    }

    _onResize = () => {
        this._relayout();
    };

    _relayout = (cb) => {
        var width = $(window).width();
        if (width <= 768)
            this.setState({itemsPerRow: 3}, cb);
        else if (width <= 960)
            this.setState({itemsPerRow: 4}, cb);
        else
            this.setState({itemsPerRow: 5}, cb);
    };
}

export default VideoSearch;
