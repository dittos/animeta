var _ = require('lodash');
var $ = require('jquery');
if (process.env.CLIENT) {
    var _jQuery = global.jQuery;
    global.jQuery = $;
    require('typeahead.js');
    global.jQuery = _jQuery;
}
var React = require('react');
var Layout = require('./Layout');
var Grid = require('./Grid');

var DropdownUserMenu = React.createClass({
    componentDidMount() {
        $(document).on('click', this._onClose);
    },
    componentWillUnmount() {
        $(document).off('click', this._onClose);
    },
    render() {
        return <div className="menu-user"
            onClick={e => e.stopPropagation()}>
            <a href="/library/">기록 관리</a>
            <a href="/settings/">설정</a>
            <a href="/logout/">로그아웃</a>
        </div>;
    },
    _onClose() {
        this.props.onClose();
    }
});

function openWork(title) {
    location.href = '/works/' + encodeURIComponent(title) + '/';
}

function cachingSource(source, maxSize) {
    var cache = [];
    return function(q, cb) {
        for (var i = cache.length - 1; i >= 0; i--) {
            if (cache[i][0] == q) {
                cb(cache[i][1]);
                return;
            }
        }
        source(q, function(data) {
            cache.push([q, data]);
            if (cache.length >= maxSize) {
                cache.shift();
            }
            cb(data);
        });
    };
}

var searchSource = cachingSource(_.throttle(function (q, cb) {
    $.getJSON('/search/', {q: q}, cb);
}, 200), 20);

var typeaheadTemplates = {
    suggestion: function(item) {
        return React.renderToStaticMarkup(<div>
            <span className="title">{item.title}</span>
            {' '}
            <span className="count">{item.n}명 기록</span>
        </div>);
    }
};

var Search = React.createClass({
    componentDidMount() {
        $(this.refs.input.getDOMNode())
            .typeahead({highlight: true, hint: false}, {
                source: searchSource,
                displayKey: 'title',
                templates: typeaheadTemplates
            }).on('typeahead:selected', function(event, item) {
                openWork(item.title);
            }).on('keypress', function(event) {
                if (event.keyCode == 13) {
                    var self = this;
                    var q = self.value;
                    searchSource(q, function(data) {
                        if (q != self.value || data.length === 0)
                            return;
                        if (data.filter(function(item) { return item.title == q; }).length == 1)
                            openWork(q);
                        else
                            openWork(data[0].title);
                    });
                }
            });
    },
    render() {
        return <div className="global-search">
            <input type="search" placeholder="작품 검색" ref="input" />
        </div>;
    }
});

var GlobalHeader = React.createClass({
    getInitialState() {
        return {showMenu: false};
    },
    render() {
        return <Layout.CenteredFullWidth className="header">
            <Layout.LeftRight className="header-inner"
                left={this._renderLeft()}
                right={this._renderRight()} />
        </Layout.CenteredFullWidth>;
    },
    _renderLeft() {
        return <div>
            <div className="logo">
                <a href="/">animeta</a>
            </div>
            <Search />
        </div>;
    },
    _renderRight() {
        var user = this.props.currentUser;
        if (user) {
            return <div className="account">
                <a href="/library/" className="btn btn-user"
                    onClick={this._toggleMenu}>
                    <i className="fa fa-user" />
                    {user.name}
                    <i className="fa fa-caret-down" />
                </a>
                {this.state.showMenu &&
                    <DropdownUserMenu
                        onClose={() => this.setState({showMenu: false})} />}
            </div>;
        } else {
            return <div className="account">
                <a href="/login/" className="btn btn-login">로그인</a>
                <a href="/signup/" className="btn btn-signup">회원 가입</a>
            </div>;
        }
    },
    _toggleMenu(event) {
        event.preventDefault();
        this.setState({showMenu: !this.state.showMenu});
    }
});

module.exports = GlobalHeader;
