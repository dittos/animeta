import React from 'react';
import connectTwitter from '../connectTwitter';
import {
    changePassword,
    disconnectTwitter,
    logout,
} from '../API';
import Layout from '../ui/Layout';
import {App} from '../layouts';

class ChangePassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isChangingPassword: false,
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
                                disabled={this.state.isChangingPassword}
                            >
                                바꾸기
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>;
    }

    _changePassword() {
        if (!this.refs.newPassword1.value) {
            alert('변경하실 암호를 입력하세요.');
            return;
        }

        this.setState({isChangingPassword: true});
        changePassword(
            this.refs.oldPassword.value,
            this.refs.newPassword1.value,
            this.refs.newPassword2.value,
        ).then(() => {
            alert('암호를 변경했습니다.');
            this.refs.oldPassword.value = '';
            this.refs.newPassword1.value = '';
            this.refs.newPassword2.value = '';
        }).always(() => {
            this.setState({isChangingPassword: false});
        });
    }
}

class SettingsRoute extends React.Component {
    render() {
        const {currentUser} = this.props.data;
        return <Layout.CenteredFullWidth>
            <ChangePassword />

            <h2>트위터 연동</h2>
            {currentUser.is_twitter_connected ?
                <button onClick={this._disconnectTwitter.bind(this)}>연결 끊기</button>
                : <button onClick={this._connectTwitter.bind(this)}>연결하기</button>}

            <h2>로그아웃</h2>
            <button onClick={this._logout.bind(this)}>로그아웃</button>
        </Layout.CenteredFullWidth>;
    }

    _connectTwitter() {
        connectTwitter().then(() => {
            this.props.writeData(data => {
                data.currentUser.is_twitter_connected = true;
            });
        });
    }

    _disconnectTwitter() {
        disconnectTwitter().then(() => {
            this.props.writeData(data => {
                data.currentUser.is_twitter_connected = false;
            });
        });
    }

    _logout() {
        logout().then(() => {
            location.href = '/';
        });
    }
}

export default {
    component: App(SettingsRoute),

    async load({ loader, redirect }) {
        const currentUser = await loader.getCurrentUser();
        if (!currentUser)
            return redirect('/login/');
        return {
            currentUser,
        };
    }
};
