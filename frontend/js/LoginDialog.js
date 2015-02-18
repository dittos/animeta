var $ = require('jquery');
var React = require('react');

var LoginDialog = React.createClass({
    getInitialState() {
        return {
            submitted: false,
            errors: false,
            username: '',
            password: '',
            isTransient: true
        };
    },
    render() {
        return <div className="dialog-backdrop">
            <div className="dialog dialog-login">
                <div className="dialog-header">
                    <button className="dialog-close" onClick={this.props.onClose}><i className="fa fa-lg fa-times-circle" /></button>
                    <h2 className="dialog-title">로그인</h2>
                </div>
                {this.state.errors &&
                    <div className="login-errors">없는 아이디거나 암호가 틀렸습니다. 다시 시도해보세요.</div>}
                <form method="post" action="/login/" onSubmit={this._onSubmit}>
                    <div className="login-row-group">
                    <div className="login-row">
                        <label>아이디</label>
                        <input name="username" maxLength="30" autoFocus value={this.state.username} onChange={e => this.setState({username: e.target.value})} />
                    </div>
                    <div className="login-row">
                        <label>암호</label>
                        <input type="password" name="password" value={this.state.password} onChange={e => this.setState({password: e.target.value})} />
                    </div>
                    </div>
                    {!this.state.submitted && <button type="submit" className="btn-login" disabled={!this._isValid()}>로그인</button>}
                    <div className="login-check-row">
                        <label>
                            <input type="checkbox" checked={!this.state.isTransient} onChange={e => this.setState({isTransient: !e.target.checked})} />
                            2주 동안 자동 로그인
                        </label>
                    </div>
                </form>
            </div>
        </div>;
    },
    _onSubmit(event) {
        event.preventDefault();
        this.setState({submitted: true});
        $.post('/api/v2/auth', {
            'username': this.state.username,
            'password': this.state.password,
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
    },
    _isValid() {
        return this.state.username.length > 0 &&
            this.state.password.length > 0;
    }
});

module.exports = LoginDialog;
