import React from "react";
import {Container} from "flux/utils";
import $ from "jquery";
import * as ExternalServiceActions from "../store/ExternalServiceActions";
import ExternalServiceStore from "../store/ExternalServiceStore";

export default Container.create(class extends React.Component {
    static getStores() {
        return [ExternalServiceStore];
    }

    static calculateState() {
        return {
            connectedServices: ExternalServiceStore.getConnectedServices()
        };
    }

    constructor() {
        super();
        this.state = {
            isChangingPassword: false
        };
    }

    render() {
        return <div>
            <h2>암호 바꾸기</h2>
            <table>
                <tbody>
                    <tr>
                        <th><label htmlFor="id_old_password">기존 비밀번호:</label></th>
                        <td><input id="id_old_password" ref="oldPassword" type="password" /></td>
                    </tr>
                    <tr>
                        <th><label htmlFor="id_new_password1">새 비밀번호:</label></th>
                        <td><input id="id_new_password1" ref="newPassword1" type="password" /></td>
                    </tr>
                    <tr>
                        <th><label htmlFor="id_new_password2">새 비밀번호 확인:</label></th>
                        <td><input id="id_new_password2" ref="newPassword2" type="password" /></td>
                    </tr>
                    <tr>
                        <th></th>
                        <td>
                            <button
                                onClick={this._changePassword.bind(this)}
                                className="button"
                                disabled={this.state.isChangingPassword}
                            >
                                바꾸기
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <h2>트위터 연동</h2>
            {this.state.connectedServices.has('twitter') ?
                <button onClick={this._disconnectTwitter}>연결 끊기</button>
                : <button onClick={this._connectTwitter}>연결하기</button>}
        </div>;
    }

    _connectTwitter() {
        ExternalServiceActions.connectTwitter();
    }

    _disconnectTwitter() {
        ExternalServiceActions.disconnectService('twitter');
    }

    _changePassword() {
        if (!this.refs.newPassword1.value) {
            alert('변경하실 암호를 입력하세요.');
            return;
        }

        this.setState({isChangingPassword: true});
        $.post('/api/v2/me/password', {
            old_password: this.refs.oldPassword.value,
            new_password1: this.refs.newPassword1.value,
            new_password2: this.refs.newPassword2.value,
        }).then(() => {
            alert('암호를 변경했습니다.');
            this.refs.oldPassword.value = '';
            this.refs.newPassword1.value = '';
            this.refs.newPassword2.value = '';
        }).always(() => {
            this.setState({isChangingPassword: false});
        });
    }
})
