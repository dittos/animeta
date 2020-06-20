import $ from 'jquery';
import React from 'react';
import Styles from './LoginForm.less';
import ModalStyles from './Modal.less';
import * as API from '../API';

class LoginForm extends React.Component {
  state = {
    submitted: false,
    errors: false,
    isTransient: true,
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
              <input name="username" maxLength="30" autoFocus ref="username" />
            </div>
            <div className={Styles.loginRow}>
              <label>암호</label>
              <input type="password" name="password" ref="password" />
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
                checked={!this.state.isTransient}
                onChange={e =>
                  this.setState({
                    isTransient: !e.target.checked,
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

  _onSubmit = event => {
    event.preventDefault();
    this.setState({ submitted: true });
    const username = this.refs.username.value;
    API.post('/api/v2/auth', {
      username: username,
      password: this.refs.password.value,
      transient: this.state.isTransient ? 'true' : 'false',
    }).then(
      result => {
        if (result.ok) {
          if (this.props.next) {
            location.href = this.props.next.redirectToUser
              ? `/users/${username}/`
              : this.props.next;
          } else {
            location.reload();
          }
        } else {
          this.setState({
            submitted: false,
            errors: true,
          });
        }
      },
      () => {
        this.setState({
          submitted: false,
        });
      }
    );
  };
}

export default LoginForm;
