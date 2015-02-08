var $ = require('jquery');
var cookie = require('cookie');
var React = require('react');
var Layout = require('./Layout');
var Typeahead = require('./Typeahead');

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

var Search = React.createClass({
    componentDidMount() {
        Typeahead.init(this.refs.input.getDOMNode(),
            {highlight: true, hint: false}, {
                source: Typeahead.searchSource,
                displayKey: 'title',
                templates: Typeahead.templates
            }).on('typeahead:selected', function(event, item) {
                openWork(item.title);
            }).on('keypress', function(event) {
                if (event.keyCode == 13) {
                    var self = this;
                    var q = self.value;
                    Typeahead.searchSource(q, function(data) {
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

var LoginDialog = React.createClass({
    getInitialState() {
        return {csrfToken: cookie.parse(document.cookie).csrftoken};
    },
    render() {
        return <div className="dialog-backdrop">
            <div className="dialog dialog-login">
                <div className="dialog-header">
                    <button className="dialog-close" onClick={this.props.onClose}><i className="fa fa-lg fa-times-circle" /></button>
                    <h2 className="dialog-title">로그인</h2>
                </div>
                <form method="post" action="/login/">
                    <input type="hidden" name="csrfmiddlewaretoken" value={this.state.csrfToken} />
                    <div className="login-row-group">
                    <div className="login-row">
                        <label>아이디</label>
                        <input name="username" maxLength="30" autoFocus />
                    </div>
                    <div className="login-row">
                        <label>암호</label>
                        <input type="password" name="password" id="login_password" />
                    </div>
                    </div>
                    <button type="submit" className="btn-login">로그인</button>
                    <div className="login-check-row">
                        <label>
                            <input type="checkbox" name="remember" value="1" />
                            2주 동안 자동 로그인
                        </label>
                    </div>
                </form>
            </div>
        </div>;
    }
});

var GlobalHeader = React.createClass({
    getInitialState() {
        return {
            showMenu: false,
            showUserMenu: false
        };
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
            <div className={'menu-toggle ' + (this.state.showMenu ? 'active' : '')}
                onClick={this._toggleMenu}>
                <i className="fa fa-bars" />
            </div>
            <div className="logo">
                <a href="/">animeta</a>
            </div>
            <Search />
            <div className="menu-global"
                style={this.state.showMenu ? {display: 'block'} : {}}>
                <a href="/">홈</a>
                <a href="/charts/works/weekly/">순위</a>
                <a href="/table/">시간표</a>
            </div>
        </div>;
    },
    _renderRight() {
        var user = this.props.currentUser;
        if (user) {
            return <div className="account">
                <a href="/library/" className="btn btn-user"
                    onClick={this._toggleUserMenu}>
                    <i className="fa fa-user" />
                    {user.name}
                    <i className="fa fa-caret-down" />
                </a>
                {this.state.showUserMenu &&
                    <DropdownUserMenu
                        onClose={() => this.setState({showUserMenu: false})} />}
            </div>;
        } else {
            return <div className="account">
                <a href="/login/" className="btn btn-login" onClick={this._openLogin}>로그인</a>
                <a href="/signup/" className="btn btn-signup">회원 가입</a>
            </div>;
        }
    },
    _toggleUserMenu(event) {
        event.preventDefault();
        this.setState({showUserMenu: !this.state.showUserMenu});
    },
    _toggleMenu() {
        this.setState({showMenu: !this.state.showMenu});
    },
    _openLogin(e) {
        if (e) e.preventDefault();
        var container = document.getElementById('dialog-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'dialog-container';
            document.body.appendChild(container);
        }
        React.render(<LoginDialog onClose={this._closeLogin} />, container);
    },
    _closeLogin() {
        var container = document.getElementById('dialog-container');
        if (!container)
            return;
        React.unmountComponentAtNode(container);
        document.body.removeChild(container);
    }
});

module.exports = GlobalHeader;
