import * as React from 'react';
import { Link } from 'nuri';
import Styles from './UserLayout.less';
import * as Grid from './Grid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { UserLayout_CurrentUserFragment, UserLayout_UserFragment } from './__generated__/UserLayout.graphql';
import { GlobalHeader_TablePeriodNoticeFragment } from './__generated__/GlobalHeader.graphql';

export interface UserLayoutProps {
  data: UserLayoutPropsData;
  noContentWrapper?: boolean;
  children: React.ReactNode;
}

export interface UserLayoutPropsData {
  currentUser: UserLayout_CurrentUserFragment | null;
  user: UserLayout_UserFragment;
  tablePeriodNotice: GlobalHeader_TablePeriodNoticeFragment | null;
}

export default function UserLayout(props: UserLayoutProps) {
  const { user } = props.data;
  const basePath = `/users/${encodeURIComponent(user.name!)}/`;
  const joinedDate = new Date(user.joinedAt);
  return (
    <div>
      <div className={Styles.header}>
        <Grid.Row>
          <Grid.Column size={3} pull="left">
            <div className={Styles.profile}>
              <h1 className={Styles.title}>
                <Link to={basePath}>{user.name}</Link>
              </h1>
              <div className={Styles.dateJoined}>
                {joinedDate.getFullYear()}. {joinedDate.getMonth() + 1}.{' '}
                {joinedDate.getDate()} 가입
              </div>
            </div>
          </Grid.Column>
          <Grid.Column size={9} pull="left" className={Styles.nav}>
            <Link to={basePath} className={Styles.navItem}>
              작품{' '}
              <span className={Styles.navItemCount}>{user.recordCount}</span>
            </Link>
            <Link to={`${basePath}history/`} className={Styles.navItem}>
              기록{' '}
              <span className={Styles.navItemCount}>{user.postCount}</span>
            </Link>
            <div style={{ flex: 1 }} />
            {user.isCurrentUser && (
              <Link to={`/settings/`} className={Styles.settingsNavItem}>
                <FontAwesomeIcon icon={faCog} />
                설정
              </Link>
            )}
          </Grid.Column>
        </Grid.Row>
      </div>
      {props.noContentWrapper ? props.children : <div className={Styles.content}>{props.children}</div>}
    </div>
  );
}
