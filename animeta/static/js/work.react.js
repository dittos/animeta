var React = require('react');

function fixTitle(title) {
    // &lt;b&gt;...&lt;b&gt; -> <b>...</b>
    return $('<span />').html(title.replace(/&lt;(\/?b)&gt;/g, "<$1>")).text();
}

function getVideoURL(item) {
    if (item.player_url)
        return 'videos/tvpot/' + item.player_url.split('?vid=')[1] + '/';
    else
        return item.link;
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

var VideoSearchResult = React.createClass({
    getInitialState() {
        return {isLoading: true, hasMore: true, result: []};
    },

    componentDidMount() {
        this._loadMore();
    },

    componentWillReceiveProps(nextProps) {
        if (this.props.query != nextProps.query) {
            this.setState({
                isLoading: true,
                hasMore: true,
                result: [],
                page: 0
            }, this._loadMore);
        }
    },

    _loadMore() {
        var page = (this.state.page || 0) + 1;
        this.setState({isLoading: true});
        $.getJSON('http://apis.daum.net/search/vclip?callback=?', {
            apikey: PreloadData.daum_api_key,
            output: 'json',
            result: 6,
            q: this.props.query,
            pageno: page
        }).then(data => {
            var result = this.state.result.concat(data.channel.item);
            var totalCount = parseInt(data.channel.totalCount, 10);
            this.setState({
                hasMore: result.length < totalCount,
                page: page,
                isLoading: false,
                result: result
            }, () => {
                if (page > 1) {
                    var $el = $(this.getDOMNode());
                    window.scrollTo(0, $el.offset().top + $el.height() - $(window).height() + 100);
                }
            });
        });
    },

    render() {
        var rows = [];
        var currentRow = [];
        for (var i = 0; i < this.state.result.length; i++) {
            if (i > 0 && i % 3 == 0) {
                rows.push(<tr>{currentRow}</tr>);
                currentRow = [];
            }
            var item = this.state.result[i];
            currentRow.push(<td>
                <a href={getVideoURL(item)} target="_blank">
                    <div className="thumbnail"><img src={item.thumbnail} /></div>
                    <span className="title" dangerouslySetInnerHTML={{__html: shorten(fixTitle(item.title), 30)}} />
                </a>
                <span className="date">{formatDate(item.pubDate)}</span>
            </td>);
        }
        if (currentRow.length > 0) {
            rows.push(currentRow);
        }

        var loadMore;
        if (this.state.isLoading) {
            loadMore = <div className="load-more loading">로드 중...</div>;
        } else if (this.state.hasMore) {
            loadMore = <div className="load-more" onClick={this._loadMore}>검색 결과 더 보기...</div>;
        }

        return <div>
            <table>
            {rows}
            </table>
            {loadMore}
        </div>;
    }
});

var VideoSearch = React.createClass({
    getInitialState() {
        return {subQuery: null};
    },

    render() {
        var subQueries = [];
        subQueries.push(<span className={'episode ' + (!this.state.subQuery && 'active')}
            onClick={() => this.setState({subQuery: null})}>전체</span>);
        this.props.subQueries.forEach(subQuery => {
            subQueries.push(<span> &middot; </span>);
            subQueries.push(<span className={'episode ' + (this.state.subQuery == subQuery && 'active')}
                onClick={() => this.setState({subQuery: subQuery})}>{subQuery}</span>);
        });

        var query = PreloadData.work.title;
        if (this.state.subQuery) {
            query += ' ' + this.state.subQuery;
        }

        return <div>
            <p className="episodes">{subQueries}</p>
            <VideoSearchResult query={query} />
        </div>;
    }
});

React.renderComponent(<VideoSearch subQueries={['오프닝', '엔딩'].concat(PreloadData.episodes.map(ep => ep + '화'))} />, document.getElementById('videos'));
