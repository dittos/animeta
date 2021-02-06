import * as React from 'react';
import { findDOMNode } from 'react-dom';
import {
  FormGroup,
  FormLabel,
  FormControl,
  Button,
  Modal,
} from 'react-bootstrap';
import * as API from './API';

class Login extends React.Component {
  usernameInput = React.createRef()
  passwordInput = React.createRef()

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

  _submit = event => {
    event.preventDefault();
    API.login(
      this.usernameInput.current.value,
      this.passwordInput.current.value
    ).then(this.props.onLogin);
  };
}

export default Login;
