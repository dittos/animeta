import React from 'react';
import Styles from './LoginForm.module.less';
import ModalStyles from './Modal.module.less';
import {createFrontendSession} from '../API';
import {API} from '../ApiClient';

class LoginForm extends React.Component<{
  next?: string | { redirectToUser: true };
}> {
  usernameInput = React.createRef<HTMLInputElement>();
  passwordInput = React.createRef<HTMLInputElement>();
  state = {
    submitted: false,
    errors: false,
    isPersistent: false,
  };

  render() {
    return (
      <div>
        {this.state.errors && (
          <div className={Styles.loginErrors}>
            없는 아이디거나 암호가 틀렸습니다. 다시 시도해보세요.
          </div>
        )}
        <form method="post" action="/login/" onSubmit={this._onSubmit}>
          <div className={Styles.loginRowGroup}>
            <div className={Styles.loginRow}>
              <label>아이디</label>
              <input name="username" maxLength={30} autoFocus ref={this.usernameInput} />
            </div>
            <div className={Styles.loginRow}>
              <label>암호</label>
              <input type="password" name="password" ref={this.passwordInput} />
            </div>
          </div>
          {!this.state.submitted && (
            <button type="submit" className={ModalStyles.confirmButton}>
              로그인
            </button>
          )}
          <div className={Styles.loginCheckRow}>
            <label>
              <input
                type="checkbox"
                checked={this.state.isPersistent}
                onChange={e =>
                  this.setState({
                    isPersistent: e.target.checked,
                  })
                }
              />
              90일 동안 자동 로그인
            </label>
          </div>
        </form>
      </div>
    );
  }

  _onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    this.setState({ submitted: true });
    const username = this.usernameInput.current!.value;
    API.call('/api/v5/LoginForm/authenticate', {
      username: username,
      password: this.passwordInput.current!.value,
      persistent: this.state.isPersistent,
    }).then(
      authResult => createFrontendSession({ authResult }).then(() => {
        if (this.props.next) {
          location.href = (this.props.next as any).redirectToUser
            ? `/users/${username}/`
            : this.props.next as string;
        } else {
          location.reload();
        }
      }),
      () => {
        this.setState({
          submitted: false,
        });
      }
    );
  };
}

export default LoginForm;
