import * as React from 'react';
import { Link } from 'nuri';
import * as Layout from './Layout';
import LoginDialog from './LoginDialog';
import SearchInput from './SearchInput';
import { Dropdown } from './Dropdown';
import Styles from './GlobalHeader.less';
import { getStatusDisplay } from '../util';
import { RecordDTO, UserDTO } from '../../../shared/types_generated';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faHome, faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { getUserRecords } from '../API';

class DropdownUserMenu extends React.Component<{
  user: UserDTO;
}> {
  state = {
    records: null as RecordDTO[] | null,
  };

  componentDidMount() {
    getUserRecords(this.props.user.name, {
      sort: 'date',
      status_type: 'watching',
      limit: 10,
    }).then(records => {
      this.setState({ records });
    });
  }

  render() {
    return (
      <>
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
      </>
    );
  }
}

export type GlobalHeaderProps = {
  currentUser?: UserDTO | null;
  noNotice?: boolean;
  noHero?: boolean;
  activeMenu?: 'home' | 'search' | 'user' | null;
};

export class GlobalHeader extends React.Component<GlobalHeaderProps> {
  static LAST_NOTICE_CLICKED = 'lastNoticeClicked';
  static noticeId = '2023Q1';

  state = {
    showNotice: false,
  };

  componentDidMount() {
    try {
      if (window.localStorage.getItem(GlobalHeader.LAST_NOTICE_CLICKED) !== GlobalHeader.noticeId) {
        this.setState({ showNotice: true });
      }
    } catch (e) {
      // ignore
    }
  }

  render() {
    const activeMenu = this.props.activeMenu;
    const user = this.props.currentUser;
    const showNotice = this.state.showNotice && activeMenu !== 'search' && !this.props.noNotice;
    // const showNotice = false;
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
                  <FontAwesomeIcon icon={faHome} size="sm" />
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
                onClick={this._saveNoticeClicked}
              >
                <span>
                  <FontAwesomeIcon icon={faSearch} size="sm" />
                </span>
                <span className={Styles.globalMenuItemText}>작품 찾기</span>
                {showNotice && (
                  <span className={Styles.globalMenuItemPopover}>
                    2023년 1월 신작 업데이트
                  </span>
                )}
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
                  <FontAwesomeIcon icon={faUser} size="sm" />
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
              <Dropdown
                containerClassName={`${Styles.accountMenu} hide-mobile`}
                contentClassName={Styles.userMenu}
                renderTrigger={({ toggle }) => (
                  <Link
                    to={`/users/${user.name}/`}
                    className={Styles.userButton}
                    onClick={toggle}
                  >
                    <FontAwesomeIcon icon={faUser} />
                    {user.name}
                    <FontAwesomeIcon icon={faCaretDown} />
                  </Link>
                )}
              >
                <DropdownUserMenu user={user} />
              </Dropdown>
            )}
          </div>
        </Layout.CenteredFullWidth>

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

  _openLoginIfNeeded = (e: React.MouseEvent) => {
    if (!this.props.currentUser) {
      e.preventDefault();
      LoginDialog.open({ next: { redirectToUser: true } }); // FIXME
    }
  };

  _openLogin = (e: React.MouseEvent) => {
    if (e) e.preventDefault();
    LoginDialog.open();
  };

  _closeLogin = () => {
    LoginDialog.close();
  };

  _saveNoticeClicked = () => {
    try {
      window.localStorage.setItem(GlobalHeader.LAST_NOTICE_CLICKED, GlobalHeader.noticeId);
      this.setState({ showNotice: false });
    } catch (e) {
      // ignore
    }
  };
}
