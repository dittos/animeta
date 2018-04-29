import $ from 'jquery';
import * as React from 'react';
import { Link } from 'nuri';
import * as Layout from './Layout';
import LoginDialog from './LoginDialog';
import Styles from './GlobalHeader.less';
import { getStatusDisplay } from '../util';
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
    return (
      <div className={Styles.userMenu} onClick={e => e.stopPropagation()}>
        <Link to={`/users/${this.props.user.name}/`}>내 기록</Link>
        <Link to="/settings/">설정</Link>
        {this.state.records && (
          <div>
            <div className={Styles.userMenuSeparator}>바로가기</div>
            {this.state.records.map(record => (
              <Link to={`/records/${record.id}/`}>
                {record.title}
                <span className={Styles.quickRecordStatus}>
                  {getStatusDisplay(record)}
                </span>
              </Link>
            ))}
            <Link
              to={`/users/${this.props.user.name}/`}
              className={Styles.quickRecordViewAll}
            >
              전체 보기
            </Link>
          </div>
        )}
      </div>
    );
  }

  _onClose = () => {
    this.props.onClose();
  };
}

export class GlobalHeader extends React.Component {
  state = {
    showUserMenu: false,
  };

  render() {
    const showNotice = false;
    const activeMenu = this.props.activeMenu;
    const user = this.props.currentUser;
    return (
      <div className={Styles.container}>
        <Layout.CenteredFullWidth className={Styles.header}>
          <div className={Styles.headerInner}>
            <div className={`${Styles.logo} hide-mobile`}>
              <Link to="/">애니메타</Link>
            </div>
            <div className={Styles.globalMenu}>
              <Link
                to="/"
                className={
                  activeMenu === 'home'
                    ? Styles.activeGlobalMenuItem
                    : Styles.globalMenuItem
                }
              >
                <span>
                  <i className="fa fa-home" />
                </span>
                <span className={Styles.globalMenuItemText}>홈</span>
              </Link>
              <Link
                to="/table/"
                className={
                  activeMenu === 'search'
                    ? Styles.activeGlobalMenuItem
                    : Styles.globalMenuItem
                }
              >
                <span>
                  <i
                    className="fa fa-search"
                    style={{
                      fontSize: '0.8em',
                      verticalAlign: '10%',
                    }}
                  />
                </span>
                <span className={Styles.globalMenuItemText}>작품 찾기</span>
              </Link>
              <Link
                to={
                  this.props.currentUser
                    ? `/users/${this.props.currentUser.name}/`
                    : '/login/'
                }
                className={
                  activeMenu === 'user'
                    ? Styles.activeGlobalMenuItem
                    : Styles.globalMenuItem
                }
                onClick={this._openLoginIfNeeded}
              >
                <span>
                  <i
                    className="fa fa-user"
                    style={{
                      fontSize: '0.85em',
                      verticalAlign: '5%',
                    }}
                  />
                </span>
                <span className={Styles.globalMenuItemText}>내 기록</span>
              </Link>
              {/*<Link to="" className={`${activeMenu === 'more' ? Styles.activeGlobalMenuItem : Styles.globalMenuItem} show-mobile`}>
                            <span><i className="fa fa-bars" style={{fontSize: '0.9em', verticalAlign: '5%'}} /></span>
                        </Link>*/}
            </div>
            <div style={{ flex: 1 }} className="hide-mobile" />
            <div className={Styles.search}>
              <SearchInput />
            </div>
            {user && (
              <div className={`${Styles.accountMenu} hide-mobile`}>
                <Link
                  to={`/users/${user.name}/`}
                  className={Styles.userButton}
                  onClick={this._toggleUserMenu}
                >
                  <i className="fa fa-user" />
                  {user.name}
                  <i className="fa fa-caret-down" />
                </Link>
                {this.state.showUserMenu && (
                  <DropdownUserMenu
                    user={user}
                    onClose={() =>
                      this.setState({
                        showUserMenu: false,
                      })
                    }
                    Link={Link}
                  />
                )}
              </div>
            )}
          </div>
        </Layout.CenteredFullWidth>

        {showNotice && (
          <Layout.CenteredFullWidth className={Styles.notice}>
            <Link to="/table/" className={Styles.noticeLink}>
              4월 신작 살펴보기!
            </Link>
          </Layout.CenteredFullWidth>
        )}

        {!this.props.currentUser &&
          !this.props.noHero && (
            <div className={Styles.hero}>
              <Layout.CenteredFullWidth>
                <div className={Styles.slogan}>
                  애니 보고 나서,{' '}
                  <span className={Styles.sloganBrand}>애니메타</span>
                </div>
                <div className={Styles.subSlogan}>
                  애니메타는 애니메이션 감상 기록장입니다.<br />
                  어떤 작품을 몇 화까지 봤는지 감상평과 함께 기록하실 수 있어요.
                </div>

                <div className={Styles.heroActions}>
                  <a
                    href="/login/"
                    onClick={this._openLogin}
                    className={Styles.heroLoginButton}
                  >
                    로그인
                  </a>
                  <Link to="/signup/" className={Styles.heroSignUpButton}>
                    가입하기
                  </Link>
                </div>
              </Layout.CenteredFullWidth>
            </div>
          )}
      </div>
    );
  }

  _toggleUserMenu = event => {
    event.preventDefault();
    this.setState({ showUserMenu: !this.state.showUserMenu });
  };

  _openLoginIfNeeded = e => {
    if (!this.props.currentUser) {
      e.preventDefault();
      LoginDialog.open({ next: { redirectToUser: true } }); // FIXME
    }
  };

  _openLogin = e => {
    if (e) e.preventDefault();
    LoginDialog.open();
  };

  _closeLogin = () => {
    LoginDialog.close();
  };
}
