import * as React from 'react';
import {
  FormGroup,
  FormLabel,
  FormControl,
  Button,
  Modal,
} from 'react-bootstrap';
import { API, saveSessionKey } from './ApiClient';

class Login extends React.Component<{
  onLogin: () => void;
}> {
  usernameInput = React.createRef<HTMLInputElement>()
  passwordInput = React.createRef<HTMLInputElement>()

  render() {
    return (
      <Modal.Dialog>
        <form onSubmit={this._submit}>
          <Modal.Body>
            <FormGroup>
              <FormLabel>Username</FormLabel>
              <FormControl ref={this.usernameInput} autoFocus />
            </FormGroup>
            <FormGroup>
              <FormLabel>Password</FormLabel>
              <FormControl ref={this.passwordInput} type="password" />
            </FormGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="primary" type="submit">
              Login
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Dialog>
    );
  }

  _submit = (event: React.FormEvent) => {
    event.preventDefault();
    API.call('/api/admin/v1/Login/authenticate', {
      username: this.usernameInput.current!.value,
      password: this.passwordInput.current!.value,
    }).then(result => {
      saveSessionKey(result.sessionKey)
      this.props.onLogin()
    })
  };
}

export default Login;
