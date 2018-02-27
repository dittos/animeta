import $ from 'jquery';
import * as React from 'react';
import { Link } from 'nuri';
import * as Layout from './Layout';
import LoginDialog from './LoginDialog';
import Styles from './GlobalHeader.less';
import {getStatusDisplay} from '../util';
import SearchInput from '../ui/SearchInput';

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
        return <div className={Styles.userMenu}
            onClick={e => e.stopPropagation()}>
            <Link to={`/users/${this.props.user.name}/`}>기록 관리</Link>
            <Link to="/settings/">설정</Link>
            {this.state.records && <div>
                <div className={Styles.userMenuSeparator}>
                    바로가기
                </div>
                {this.state.records.map(record =>
                    <Link to={`/records/${record.id}/`}>
                        {record.title}
                        <span className={Styles.quickRecordStatus}>{getStatusDisplay(record)}</span>
                    </Link>
                )}
                <Link to={`/users/${this.props.user.name}/`} className={Styles.quickRecordViewAll}>전체 보기</Link>
            </div>}
        </div>;
    }

    _onClose = () => {
        this.props.onClose();
    };
}

class GlobalHeader extends React.Component {
    static contextTypes = {
        controller: React.PropTypes.object,
    };

    state = {
        showMenu: false,
        showUserMenu: false
    };

    render() {
        const showNotice = false;
        return <div className={Styles.container}>
            <Layout.CenteredFullWidth className={Styles.header}>
                <Layout.LeftRight className={Styles.headerInner}
                    left={this._renderLeft()}
                    right={this._renderRight()} />
            </Layout.CenteredFullWidth>

            {showNotice && <Layout.CenteredFullWidth className={Styles.notice}>
                <Link to="/table/" className={Styles.noticeLink}>
                    2018년 1월 신작 살펴보기!
                </Link>
            </Layout.CenteredFullWidth>}

            {!this.props.currentUser && (
                <div className={Styles.hero}>
                    <Layout.CenteredFullWidth>
                        <div className={Styles.slogan}>
                            애니 보고 나서,{' '}
                            <span className={Styles.sloganBrand}>애니메타</span>
                        </div>
                        <div className={Styles.subSlogan}>
                            애니메타는 애니메이션 감상 기록 관리 서비스입니다.
                        </div>

                        <div className={Styles.heroActions}>
                            <a href="/login/" onClick={this._openLogin} className={Styles.heroLoginButton}>로그인</a>
                            <Link to="/signup/" className={Styles.heroSignUpButton}>가입하기</Link>
                        </div>
                    </Layout.CenteredFullWidth>
                </div>
            )}
        </div>;
    }

    _renderLeft() {
        return <div>
            <div className={this.state.showMenu ? Styles.menuToggleActive : Styles.menuToggleNormal}
                onClick={this._toggleMenu}>
                <i className="fa fa-bars" />
            </div>
            <div className={Styles.logo}>
                <Link to="/">애니메타</Link>
            </div>
            <div className={Styles.search}>
                <SearchInput onSelect={this._openWork} />
            </div>
            <div className={Styles.globalMenu}
                style={this.state.showMenu ? {display: 'block'} : {}}>
                <Link to="/">홈</Link>
                <Link to="/charts/works/weekly/">순위</Link>
                <Link to="/table/">분기별 신작</Link>
            </div>
            <div className={Styles.feedbackMenu}>
                <a href="/support/"><i className="fa fa-bullhorn" />{' '}버그 제보 / 건의</a>
            </div>
        </div>;
    }

    _renderRight() {
        var user = this.props.currentUser;
        if (user) {
            return <div className={Styles.accountMenu}>
                <Link to={`/users/${user.name}/`} className={Styles.userButton}
                    onClick={this._toggleUserMenu}>
                    <i className="fa fa-user" />
                    {user.name}
                    <i className="fa fa-caret-down" />
                </Link>
                {this.state.showUserMenu &&
                    <DropdownUserMenu
                        user={user}
                        onClose={() => this.setState({showUserMenu: false})}
                        Link={Link} />}
            </div>;
        } else {
            return <div className={Styles.accountMenu}>
                <Link to="/login/" className={Styles.loginButton} onClick={this._openLogin}>로그인</Link>
                <Link to="/signup/" className={Styles.signUpButton}>회원 가입</Link>
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

    _openWork = (title) => {
        const path = '/works/' + encodeURIComponent(title) + '/';
        if (this.context.controller) {
            this.context.controller.load({path, query: {}});
        } else {
            location.href = path;
        }
    };
}

module.exports = GlobalHeader;
