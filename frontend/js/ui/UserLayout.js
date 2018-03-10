import * as React from 'react';
import { Link } from 'nuri';
import * as Styles from './UserLayout.less';
import * as Grid from './Grid';

export default function UserLayout(props) {
  const { user, currentUser } = props.data;
  const basePath = `/users/${encodeURIComponent(user.name)}/`;
  const joinedDate = new Date(user.date_joined);
  const isCurrentUser = currentUser && currentUser.id === user.id;
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
              <span className={Styles.navItemCount}>{user.record_count}</span>
            </Link>
            <Link to={`${basePath}history/`} className={Styles.navItem}>
              기록{' '}
              <span className={Styles.navItemCount}>{user.history_count}</span>
            </Link>
            <div style={{ flex: 1 }} />
            {isCurrentUser && (
              <Link to={`/settings/`} className={Styles.settingsNavItem}>
                <i className="fa fa-cog" />
                설정
              </Link>
            )}
          </Grid.Column>
        </Grid.Row>
      </div>
      <div className={Styles.content}>{props.children}</div>
    </div>
  );
}
