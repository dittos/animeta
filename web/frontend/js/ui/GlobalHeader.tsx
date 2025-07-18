import * as React from 'react';
import { Link } from 'nuri';
import * as Layout from './Layout';
import LoginDialog from './LoginDialog';
import SearchInput from './SearchInput';
import { Dropdown } from './Dropdown';
import Styles from './GlobalHeader.module.less';
import { getStatusDisplayGql } from '../util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faHome, faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import { graphql } from '../API';
import { GlobalHeader_QuickRecordsDocument, GlobalHeader_QuickRecords_RecordFragment, GlobalHeader_TablePeriodNoticeFragment } from './__generated__/GlobalHeader.graphql';

type DropdownUserMenuState = {
  records: GlobalHeader_QuickRecords_RecordFragment[] | null,
}

class DropdownUserMenu extends React.Component<{
  username: string;
}, DropdownUserMenuState> {
  state: DropdownUserMenuState = {
    records: null,
  };

  componentDidMount() {
    graphql(GlobalHeader_QuickRecordsDocument).then(result => {
      this.setState({ records: result.currentUser?.records.nodes ?? null });
    });
  }

  render() {
    const records = this.state.records
    return (
      <>
        <Link to={`/users/${this.props.username}/`}>내 기록</Link>
        <Link to="/settings/">설정</Link>
        {records && (
          <div>
            <div className={Styles.userMenuSeparator}>바로가기</div>
            {records.map(record => (
              <Link to={`/records/${record.databaseId}/`}>
                {record.title}
                <span className={Styles.quickRecordStatus}>
                  {getStatusDisplayGql(record)}
                </span>
              </Link>
            ))}
            <Link
              to={`/users/${this.props.username}/`}
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
  currentUsername?: string | null;
  noNotice?: boolean;
  noHero?: boolean;
  activeMenu?: 'home' | 'search' | 'user' | null;
  tablePeriodNotice: GlobalHeader_TablePeriodNoticeFragment | null;
};

export function GlobalHeader({
  currentUsername,
  noNotice,
  noHero,
  activeMenu,
  tablePeriodNotice,
}: GlobalHeaderProps) {
  const LAST_NOTICE_CLICKED = 'lastNoticeClicked';
  const [showNotice, setShowNotice] = React.useState(false);

  React.useEffect(() => {
    try {
      if (tablePeriodNotice) {
        const { id, showUntil } = tablePeriodNotice;
        if (
          window.localStorage.getItem(LAST_NOTICE_CLICKED) !== id &&
          (!showUntil || Date.now() < new Date(showUntil).getTime())
        ) {
          setShowNotice(true);
        }
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablePeriodNotice]);

  const username = currentUsername;
  const shouldShowNotice = showNotice && activeMenu !== 'search' && !noNotice;

  const _openLoginIfNeeded = (e: React.MouseEvent) => {
    if (!currentUsername) {
      e.preventDefault();
      LoginDialog.open({ next: { redirectToUser: true } }); // FIXME
    }
  };

  const _openLogin = (e: React.MouseEvent) => {
    if (e) e.preventDefault();
    LoginDialog.open();
  };

  const _saveNoticeClicked = () => {
    try {
      window.localStorage.setItem(
        LAST_NOTICE_CLICKED,
        tablePeriodNotice?.id || ''
      );
      setShowNotice(false);
    } catch (e) {
      // ignore
    }
  };

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
              onClick={_saveNoticeClicked}
            >
              <span>
                <FontAwesomeIcon icon={faSearch} size="sm" />
              </span>
              <span className={Styles.globalMenuItemText}>작품 찾기</span>
              {shouldShowNotice && (
                <span className={Styles.globalMenuItemPopover}>
                  {tablePeriodNotice?.content}
                </span>
              )}
            </Link>
            <Link
              to={
                username
                  ? `/users/${username}/`
                  : '/login/'
              }
              className={
                activeMenu === 'user'
                  ? Styles.activeGlobalMenuItem
                  : Styles.globalMenuItem
              }
              onClick={_openLoginIfNeeded}
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
          {username && (
            <Dropdown
              containerClassName={`${Styles.accountMenu} hide-mobile`}
              contentClassName={Styles.userMenu}
              renderTrigger={({ toggle }) => (
                <Link
                  to={`/users/${username}/`}
                  className={Styles.userButton}
                  onClick={toggle}
                >
                  <FontAwesomeIcon icon={faUser} />
                  {username}
                  <FontAwesomeIcon icon={faCaretDown} />
                </Link>
              )}
            >
              <DropdownUserMenu username={username} />
            </Dropdown>
          )}
        </div>
      </Layout.CenteredFullWidth>

      {!currentUsername &&
        !noHero && (
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
                  onClick={_openLogin}
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
