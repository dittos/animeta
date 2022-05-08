import React from 'react';
import ReactDOM from 'react-dom';
import { Modal } from 'react-overlays';
import ModalStyles from './Modal.less';
import LoginForm from './LoginForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

type Props = {
  onClose?(): any;
  next?: string | { redirectToUser: true };
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
        renderBackdrop={(props: any) => <div className={ModalStyles.backdrop} {...props} />}
        onHide={this.props.onClose}
      >
        <div className={ModalStyles.dialog}>
          <div className={ModalStyles.header}>
            <button
              className={ModalStyles.closeButton}
              onClick={this.props.onClose}
            >
              <FontAwesomeIcon icon={faTimesCircle} size="lg" />
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
