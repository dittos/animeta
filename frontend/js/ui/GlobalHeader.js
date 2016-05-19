var $ = require('jquery');
var React = require('react');
import {Link as RouterLink} from '../Isomorphic';
var Layout = require('./Layout');
var Typeahead = require('./Typeahead');
import LoginDialog from './LoginDialog';
import Styles from './GlobalHeader.less';

var DropdownUserMenu = React.createClass({
    componentDidMount() {
        $(document).on('click', this._onClose);
    },
    componentWillUnmount() {
        $(document).off('click', this._onClose);
    },
    render() {
        return <div className={Styles.userMenu}
            onClick={e => e.stopPropagation()}>
            <a href="/library/">기록 관리</a>
            <a href="/settings/">설정</a>
            <a href="#" onClick={this._logout}>로그아웃</a>
        </div>;
    },
    _onClose() {
        this.props.onClose();
    },
    _logout() {
        $.ajax({
            url: '/api/v2/auth',
            method: 'DELETE'
        }).then(() => {
            location.href = '/';
        });
    }
});

function openWork(title) {
    location.href = '/works/' + encodeURIComponent(title) + '/';
}

var Search = React.createClass({
    componentDidMount() {
        Typeahead.init(this.refs.input,
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
        return <div className={Styles.search}>
            <input type="search" placeholder="작품 검색" ref="input" />
        </div>;
    }
});

function CompatLink(linkProps) {
    var {href, ...props} = linkProps;
    return <RouterLink to={href} {...props} />;
}

var GlobalHeader = React.createClass({
    getInitialState() {
        return {
            showMenu: false,
            showUserMenu: false
        };
    },
    render() {
        var Link = this.props.useRouterLink ? CompatLink : 'a';
        return <div className={Styles.container}>
            <Layout.CenteredFullWidth className={Styles.header}>
                <Layout.LeftRight className={Styles.headerInner}
                    left={this._renderLeft(Link)}
                    right={this._renderRight(Link)} />
            </Layout.CenteredFullWidth>
            {/*
            <Layout.CenteredFullWidth className={Styles.notice}>
                <span className={Styles.noticeLabel}>
                    <i className="fa fa-bell" />
                </span>
                <Link href="/table/" className={Styles.noticeText}>
                    <b>2016년 4월 신작</b>이 업데이트 됐습니다.
                </Link>
                <Link href="/table/" className={Styles.noticeAction}>
                    보러가기!
                </Link>
            </Layout.CenteredFullWidth>
            */}
        </div>;
    },
    _renderLeft(Link) {
        return <div>
            <div className={this.state.showMenu ? Styles.menuToggleActive : Styles.menuToggleNormal}
                onClick={this._toggleMenu}>
                <i className="fa fa-bars" />
            </div>
            <div className={Styles.logo}>
                <Link href="/">애니메타</Link>
            </div>
            <Search />
            <div className={Styles.globalMenu}
                style={this.state.showMenu ? {display: 'block'} : {}}>
                <Link href="/">홈</Link>
                <Link href="/charts/works/weekly/">순위</Link>
                <Link href="/table/">분기별 신작</Link>
            </div>
            <div className={Styles.feedbackMenu}>
                <a href="/support/"><i className="fa fa-bullhorn" />{' '}버그 제보 / 건의</a>
            </div>
        </div>;
    },
    _renderRight(Link) {
        var user = this.props.currentUser;
        if (user) {
            return <div className={Styles.accountMenu}>
                <a href="/library/" className={Styles.userButton}
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
            return <div className={Styles.accountMenu}>
                <Link href="/login/" className={Styles.loginButton} onClick={this._openLogin}>로그인</Link>
                <Link href="/signup/" className={Styles.signUpButton}>회원 가입</Link>
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
        LoginDialog.open();
    },
    _closeLogin() {
        LoginDialog.close();
    }
});

module.exports = GlobalHeader;
