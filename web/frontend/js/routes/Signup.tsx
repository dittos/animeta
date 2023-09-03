import React from 'react';
import { AppLayout } from '../layouts/AppLayout';
import { createFrontendSession } from '../API';
import { trackEvent } from '../Tracking';
import { RouteComponentProps } from '../routes';
import Styles from './Signup.module.less';
import { API } from '../ApiClient';
import { AuthResult } from '../../../shared/client';

class Signup extends React.Component<RouteComponentProps<any>> {
  state = {
    submitted: false,
    username: '',
    password: '',
    passwordCheck: '',
  };

  render() {
    return (
      <div className={Styles.container} onSubmit={this.onSubmit}>
        <div className={Styles.header}>
          <h2 className={Styles.title}>회원 가입</h2>
        </div>
        <form method="post" action="/signup/">
          <div className={Styles.row}>
            <label>아이디</label>
            <input
              name="username"
              maxLength={30}
              autoFocus
              value={this.state.username}
              onChange={e => this.setState({ username: e.target.value })}
            />
            <div className={Styles.hint}>
              알파벳, 숫자, '_' 만 가능. 최대 30글자.
            </div>
          </div>
          <div className={Styles.row}>
            <label>암호</label>
            <input
              type="password"
              value={this.state.password}
              onChange={e => this.setState({ password: e.target.value })}
            />
          </div>
          <div className={Styles.row}>
            <label>암호 (확인)</label>
            <input
              type="password"
              value={this.state.passwordCheck}
              onChange={e =>
                this.setState({
                  passwordCheck: e.target.value,
                })
              }
            />
          </div>
          <button
            type="submit"
            className={Styles.signupButton}
            disabled={this.state.submitted}
          >
            회원 가입
          </button>
        </form>
      </div>
    );
  }

  validate(): string | null {
    const { username, password, passwordCheck } = this.state;
    if (username.length === 0) {
      return '아이디를 입력하세요.';
    }
    if (username.length > 30 || !username.match(/^[A-Za-z0-9_]+$/)) {
      return '사용할 수 없는 아이디 형식입니다.';
    }
    if (password.length === 0) {
      return '암호를 입력하세요.';
    }
    if (password !== passwordCheck) {
      return '암호 확인을 정확히 입력하세요.';
    }
    return null;
  }

  private onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const invalid = this.validate();
    if (invalid) {
      alert(invalid);
      return;
    }

    this.setState({ submitted: true });
    try {
      const result = await API.call('/api/v5/Signup/createAccount', {
        username: this.state.username,
        password1: this.state.password,
        password2: this.state.passwordCheck,
      });
      this.handleSuccess(result);
    } catch (e) {
      this.setState({ submitted: false });
    }
  };

  private handleSuccess = async (result: { authResult: AuthResult }) => {
    const basePath = `/users/${encodeURIComponent(this.state.username)}/`;
    trackEvent({
      eventCategory: 'User',
      eventAction: 'SignUp',
    });
    try {
      await createFrontendSession({ authResult: result.authResult });
    } catch (e) {
      // ignore
    }
    this.props.controller!.load({
      path: basePath,
      query: {},
    });
  }
}

export default AppLayout({ noHero: true }).wrap({
  component: Signup,
  load: async () => ({}),
  renderTitle: () => '회원 가입',
});
