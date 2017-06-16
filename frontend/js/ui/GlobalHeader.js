import $ from 'jquery';
import React from 'react';
import {Link as RouterLink} from 'nuri';
import * as Layout from './Layout';
var Typeahead = require('./Typeahead');
import LoginDialog from './LoginDialog';
import Styles from './GlobalHeader.less';
import {getStatusDisplay} from '../util';

class DropdownUserMenu extends React.Component {
    state = {
        records: null,
    };

    componentDidMount() {
        $(document).on('click', this._onClose);

        $.get(`/api/v2/users/${this.props.user.name}/records`, {
            sort: 'date',
            status_type: 'watching',
            limit: 10,
        }).then(records => {
            this.setState({ records });
        });
    }

    componentWillUnmount() {
        $(document).off('click', this._onClose);
    }

    render() {
        const {Link} = this.props;
        return <div className={Styles.userMenu}
            onClick={e => e.stopPropagation()}>
            <a href={`/users/${this.props.user.name}/`}>기록 관리</a>
            <Link href="/settings/">설정</Link>
            {this.state.records && <div>
                <div className={Styles.userMenuSeparator}>
                    바로가기
                </div>
                {this.state.records.map(record =>
                    <a href={`/records/${record.id}/`}>
                        {record.title}
                        <span className={Styles.quickRecordStatus}>{getStatusDisplay(record)}</span>
                    </a>
                )}
                <a href={`/users/${this.props.user.name}/`} className={Styles.quickRecordViewAll}>전체 보기</a>
            </div>}
        </div>;
    }

    _onClose = () => {
        this.props.onClose();
    };
}

function openWork(title) {
    location.href = '/works/' + encodeURIComponent(title) + '/';
}

class Search extends React.Component {
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
    }

    render() {
        return <div className={Styles.search}>
            <input type="search" placeholder="작품 검색" ref="input" />
        </div>;
    }
}

function CompatLink(linkProps) {
    var {href, ...props} = linkProps;
    return <RouterLink to={href} {...props} />;
}

class Header extends React.Component {
    state = {
        transparent: true,
    };

    componentDidMount() {
        $(document).on('scroll', this._onScroll);
    }

    componentWillUnmount() {
        $(document).off('scroll', this._onScroll);
    }

    render() {
        const { mobileSpecial, children } = this.props;
        return (
            <Layout.CenteredFullWidth className={mobileSpecial && this.state.transparent ? Styles.mobileSpecialHeader : Styles.header}>
                {children}
            </Layout.CenteredFullWidth>
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.transparent !== this.state.transparent ||
            nextProps.mobileSpecial !== this.props.mobileSpecial ||
            nextProps.children !== this.props.children;
    }

    _onScroll = () => {
        if (!this.props.mobileSpecial)
            return;

        if ($(document).scrollTop() < 150) {
            this.setState({ transparent: true });
        } else {
            this.setState({ transparent: false });
        }
    };
}

class GlobalHeader extends React.Component {
    state = {
        showMenu: false,
        showUserMenu: false
    };

    render() {
        const { useRouterLink, mobileSpecial = false } = this.props;
        const Link = useRouterLink ? CompatLink : 'a';
        const showNotice = false;
        return <div className={mobileSpecial ? Styles.mobileSpecialContainer : Styles.container}>
            <Header mobileSpecial={mobileSpecial}>
                <Layout.LeftRight className={Styles.headerInner}
                    left={this._renderLeft(Link)}
                    right={this._renderRight(Link)} />
            </Header>
            {showNotice && !mobileSpecial && <Layout.CenteredFullWidth className={Styles.notice}>
                <Link href="/table/" className={Styles.noticeLink}>
                    2017년 4월 신작 확인하세요~
                </Link>
            </Layout.CenteredFullWidth>}
        </div>;
    }

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
    }

    _renderRight(Link) {
        var user = this.props.currentUser;
        if (user) {
            return <div className={Styles.accountMenu}>
                <a href={`/users/${user.name}/`} className={Styles.userButton}
                    onClick={this._toggleUserMenu}>
                    <i className="fa fa-user" />
                    {user.name}
                    <i className="fa fa-caret-down" />
                </a>
                {this.state.showUserMenu &&
                    <DropdownUserMenu
                        user={user}
                        onClose={() => this.setState({showUserMenu: false})}
                        Link={Link} />}
            </div>;
        } else {
            return <div className={Styles.accountMenu}>
                <Link href="/login/" className={Styles.loginButton} onClick={this._openLogin}>로그인</Link>
                <Link href="/signup/" className={Styles.signUpButton}>회원 가입</Link>
            </div>;
        }
    }

    _toggleUserMenu = (event) => {
        event.preventDefault();
        this.setState({showUserMenu: !this.state.showUserMenu});
    };

    _toggleMenu = () => {
        this.setState({showMenu: !this.state.showMenu});
    };

    _openLogin = (e) => {
        if (e) e.preventDefault();
        LoginDialog.open();
    };

    _closeLogin = () => {
        LoginDialog.close();
    };
}

module.exports = GlobalHeader;
