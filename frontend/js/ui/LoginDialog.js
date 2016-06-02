import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Modal} from 'react-overlays';
import Styles from './LoginDialog.less';
import ModalStyles from './Modal.less';

var LoginDialog = React.createClass({
    statics: {
        open() {
            var container = document.getElementById('dialog-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'dialog-container';
                document.body.appendChild(container);
            }
            ReactDOM.render(<LoginDialog onClose={LoginDialog.close} />, container);
        },
        close() {
            var container = document.getElementById('dialog-container');
            if (!container)
                return;
            ReactDOM.unmountComponentAtNode(container);
            document.body.removeChild(container);
        }
    },
    getInitialState() {
        return {
            submitted: false,
            errors: false,
            isTransient: true
        };
    },
    render() {
        return <Modal
            show={true}
            className={ModalStyles.container}
            backdropClassName={ModalStyles.backdrop}
            onHide={this.props.onClose}
        >
            <div className={ModalStyles.dialog}>
                <div className={ModalStyles.header}>
                    <button className={ModalStyles.closeButton} onClick={this.props.onClose}>
                        <i className="fa fa-lg fa-times-circle" />
                    </button>
                    <h2 className={ModalStyles.title}>로그인</h2>
                </div>
                {this.state.errors &&
                    <div className={Styles.loginErrors}>없는 아이디거나 암호가 틀렸습니다. 다시 시도해보세요.</div>}
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
                    {!this.state.submitted && <button type="submit" className={ModalStyles.confirmButton}>로그인</button>}
                    <div className={Styles.loginCheckRow}>
                        <label>
                            <input type="checkbox" checked={!this.state.isTransient} onChange={e => this.setState({isTransient: !e.target.checked})} />
                            2주 동안 자동 로그인
                        </label>
                    </div>
                </form>
            </div>
        </Modal>;
    },
    _onSubmit(event) {
        event.preventDefault();
        this.setState({submitted: true});
        $.post('/api/v2/auth', {
            'username': this.refs.username.value,
            'password': this.refs.password.value,
            'transient': this.state.isTransient ? 'true' : 'false'
        }).then(result => {
            if (result.ok) {
                if (this.props.next)
                    location.href = this.props.next;
                else
                    location.reload();
            } else {
                this.setState({
                    submitted: false,
                    errors: true
                });
            }
        });
    }
});

export default LoginDialog;
