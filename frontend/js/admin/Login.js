import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Modal,
} from 'react-bootstrap';
import * as API from './API';

class Login extends Component {
  render() {
    return (
      <Modal.Dialog>
        <form onSubmit={this._submit}>
          <Modal.Body>
            <FormGroup>
              <ControlLabel>Username</ControlLabel>
              <FormControl ref="username" autoFocus />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Password</ControlLabel>
              <FormControl ref="password" type="password" />
            </FormGroup>
          </Modal.Body>

          <Modal.Footer>
            <Button bsStyle="primary" type="submit">
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
