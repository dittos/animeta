import React from 'react';
import { deleteFrontendSession } from '../API';
import * as Layout from '../ui/Layout';
import Styles from './Settings.module.less';
import { RouteComponentProps } from '../routes';
import { API } from '../ApiClient';
import { SettingsRouteDocument, SettingsRouteQuery } from './__generated__/Settings.graphql';
import { AppLayout } from '../layouts/AppLayout';

type SettingsRouteData = SettingsRouteQuery & {
  currentUser: NonNullable<SettingsRouteQuery['currentUser']>;
};

class ChangePassword extends React.Component {
  oldPasswordInput = React.createRef<HTMLInputElement>();
  newPassword1Input = React.createRef<HTMLInputElement>();
  newPassword2Input = React.createRef<HTMLInputElement>();
  state = {
    isChangingPassword: false,
  };

  render() {
    return (
      <table className={Styles.changePasswordForm}>
        <tbody>
          <tr>
            <th>
              <label htmlFor="id_old_password">기존 암호</label>
            </th>
            <td>
              <input id="id_old_password" ref={this.oldPasswordInput} type="password" />
            </td>
          </tr>
          <tr>
            <th>
              <label htmlFor="id_new_password1">새 암호</label>
            </th>
            <td>
              <input
                id="id_new_password1"
                ref={this.newPassword1Input}
                type="password"
              />
            </td>
          </tr>
          <tr>
            <th>
              <label htmlFor="id_new_password2">새 암호 확인</label>
            </th>
            <td>
              <input
                id="id_new_password2"
                ref={this.newPassword2Input}
                type="password"
              />
            </td>
          </tr>
          <tr>
            <th />
            <td>
              <button
                onClick={this._changePassword.bind(this)}
                disabled={this.state.isChangingPassword}
              >
                바꾸기
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  _changePassword() {
    if (!this.newPassword1Input.current?.value) {
      alert('변경하실 암호를 입력하세요.');
      return;
    }
    
    if (this.newPassword1Input.current?.value !== this.newPassword2Input.current?.value) {
      alert('새 암호 확인을 정확히 입력하세요.');
      return;
    }

    this.setState({ isChangingPassword: true });
    API.call('/api/v5/Settings/changePassword', {
      oldPassword: this.oldPasswordInput.current!.value,
      newPassword: this.newPassword1Input.current!.value
    })
      .then(() => {
        alert('암호를 변경했습니다.');
        this.oldPasswordInput.current!.value = '';
        this.newPassword1Input.current!.value = '';
        this.newPassword2Input.current!.value = '';
        this.setState({ isChangingPassword: false });
      }, () => {
        this.setState({ isChangingPassword: false });
      });
  }
}

class SettingsRoute extends React.Component<RouteComponentProps<SettingsRouteData>> {
  state = {
    backupState: null,
  };

  render() {
    const { currentUser } = this.props.data;
    return (
      <Layout.CenteredFullWidth>
        <div className={Styles.section}>
          <h2 className={Styles.sectionTitle}>트위터 연동</h2>
          <div className={Styles.action}>
            {currentUser.isTwitterConnected ? <>
              상태: 연결됨<br />
              <a href="#" onClick={this._disconnectTwitter}>
                연결 끊기
              </a>
            </> : <>
              트위터 API 유료화로 연동 기능 제공을 중단합니다.
            </>}
          </div>
        </div>

        <div className={Styles.section}>
          <h2 className={Styles.sectionTitle}>
            내보내기
          </h2>
          <div className={Styles.action}>
            모든 기록을 CSV 형식으로 받을 수 있습니다.<br />
            {this.state.backupState === 'preparing' ?
              <em>파일을 준비하는 중입니다. 잠시 기다려 주세요.</em> :
              (!this.state.backupState && <a href="#" onClick={this._downloadBackup}>다운로드</a>)
            }
          </div>
        </div>

        <div className={Styles.section}>
          <h2 className={Styles.sectionTitle}>암호 바꾸기</h2>
          <div className={Styles.sectionContent}>
            <ChangePassword />
          </div>
        </div>

        <a href="#" className={Styles.logoutButton} onClick={this._logout}>로그아웃</a>
      </Layout.CenteredFullWidth>
    );
  }

  _disconnectTwitter = (event: React.MouseEvent) => {
    event.preventDefault();
    API.call('/api/v5/Settings/disconnectTwitter', {}).then(() => {
      this.props.writeData(data => {
        data.currentUser.isTwitterConnected = false;
      });
    });
  };

  _downloadBackup = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState({ backupState: 'preparing' });
    API.call('/api/v5/Settings/createBackup', {}).then(
      (result) => {
        location.href = result.downloadUrl;
        this.setState({ backupState: 'completed' });
      },
      () => this.setState({ backupState: null })
    );
  };

  _logout = (event: React.MouseEvent) => {
    event.preventDefault();
    deleteFrontendSession().then(() => {
      location.href = '/';
    });
  };
}

const routeHandler = AppLayout({ activeMenu: 'user' }).wrap({
  component: SettingsRoute,

  async load({ loader, redirect }) {
    const data = await loader.graphql(SettingsRouteDocument)
    const {currentUser} = data
    if (!currentUser) return redirect('/login/')
    return {
      ...data,
      currentUser,
    };
  },
});
export default routeHandler;
