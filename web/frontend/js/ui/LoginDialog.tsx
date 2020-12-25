import React from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'react-overlays';
import ModalStyles from './Modal.less';
import LoginForm from './LoginForm';

type Props = {
  onClose?(): any;
  next?: string;
};

class LoginDialog extends React.Component<Props> {
  static open(props?: Props) {
    var container = document.getElementById('dialog-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'dialog-container';
      document.body.appendChild(container);
    }
    ReactDOM.render(
      <LoginDialog onClose={LoginDialog.close} {...props} />,
      container
    );
  }

  static close() {
    var container = document.getElementById('dialog-container');
    if (!container) return;
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
  }

  render() {
    return (
      <Modal
        show={true}
        className={ModalStyles.container}
        backdropClassName={ModalStyles.backdrop}
        onHide={this.props.onClose}
      >
        <div className={ModalStyles.dialog}>
          <div className={ModalStyles.header}>
            <button
              className={ModalStyles.closeButton}
              onClick={this.props.onClose}
            >
              <i className="fa fa-lg fa-times-circle" />
            </button>
            <h2 className={ModalStyles.title}>로그인</h2>
          </div>
          <LoginForm next={this.props.next} />
        </div>
      </Modal>
    );
  }
}

export default LoginDialog;
