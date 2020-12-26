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
  render() {
    return (
      <Modal.Dialog>
        <form onSubmit={this._submit}>
          <Modal.Body>
            <FormGroup>
              <FormLabel>Username</FormLabel>
              <FormControl ref="username" autoFocus />
            </FormGroup>
            <FormGroup>
              <FormLabel>Password</FormLabel>
              <FormControl ref="password" type="password" />
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
      findDOMNode(this.refs.username).value,
      findDOMNode(this.refs.password).value
    ).then(this.props.onLogin);
  };
}

export default Login;
