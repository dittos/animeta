import React from "react";
import {Container} from "flux/utils";
import * as CSRF from "./CSRF";
import * as ExternalServiceActions from "./ExternalServiceActions";
import ExternalServiceStore from "./ExternalServiceStore";

export default Container.create(class extends React.Component {
    static getStores() {
        return [ExternalServiceStore];
    }

    static calculateState() {
        return {
            connectedServices: ExternalServiceStore.getConnectedServices()
        };
    }

    render() {
        const csrfInput = <input type='hidden' name='csrfmiddlewaretoken' value={CSRF.getToken()} />;
        return <div>
            <form method="post" action="/settings/">
                {csrfInput}
                <h2>암호 바꾸기</h2>
                <table>
<tr><th><label htmlFor="id_old_password">기존 비밀번호:</label></th><td><input id="id_old_password" name="old_password" type="password" /></td></tr>
<tr><th><label htmlFor="id_new_password1">새 비밀번호:</label></th><td><input id="id_new_password1" name="new_password1" type="password" /></td></tr>
<tr><th><label htmlFor="id_new_password2">새 비밀번호 확인:</label></th><td><input id="id_new_password2" name="new_password2" type="password" /></td></tr>
<tr>
    <th></th>
    <td><input type="submit" value="바꾸기" className="button" /></td>
</tr>
</table>
            </form>

            <h2>트위터 연동</h2>
            {this.state.connectedServices.has('twitter') ?
                <form method="post" action="/connect/twitter/disconnect/">
                    {csrfInput}
                    <input type="submit" value="연결 끊기" />
                </form>
                : <button onClick={this._connectTwitter}>연결하기</button>}
        </div>;
    }

    _connectTwitter() {
        window.onTwitterConnect = ok => {
            if (ok) {
                ExternalServiceActions.connectService('twitter');
            } else {
                alert('연동 실패. 잠시 후 다시 시도해주세요.');
            }
        };
        window.open('/connect/twitter/?popup=true');
    }
})
