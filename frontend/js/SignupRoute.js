var $ = require('jquery');
var React = require('react/addons');
if (process.env.CLIENT) {
    require('../less/signup.less');
}

var SignupRoute = React.createClass({
    getInitialState() {
        return {
            submitted: false,
            username: '',
            password: '',
            passwordCheck: '',
            errors: null
        };
    },
    render() {
        return <div className="signup-form" onSubmit={this._onSubmit}>
            <div className="signup-header">
                <h2 className="signup-title">회원 가입</h2>
            </div>
            {this._renderError()}
            <form method="post" action="/signup/">
                <input type="hidden" name="csrfmiddlewaretoken" value={this.state.csrfToken} />
                <div className="signup-row-group">
                <div className="signup-row signup-row-hint">
                    <label>아이디</label>
                    <span className="signup-hint">
                        알파벳, 숫자, '_' 만 가능. 최대 30글자.
                    </span>
                    <input name="username" maxLength="30" autoFocus value={this.state.username} onChange={e => this.setState({username: e.target.value})} />
                </div>
                <div className="signup-row">
                    <label>암호</label>
                    <input type="password" value={this.state.password} onChange={e => this.setState({password: e.target.value})} />
                </div>
                <div className="signup-row">
                    <label>암호 (확인)</label>
                    <input type="password" value={this.state.passwordCheck} onChange={e => this.setState({passwordCheck: e.target.value})} />
                </div>
                </div>
                {!this.state.submitted && <button type="submit" className="btn-signup" disabled={!this._isValid()}>회원 가입</button>}
            </form>
        </div>;
    },
    _renderError() {
        if (!this.state.errors)
            return null;
        var error = this.state.errors.username;
        if (!error)
            return null;
        return <div className="signup-errors">
            {error}
        </div>;
    },
    _onSubmit(event) {
        event.preventDefault();
        this.setState({submitted: true});
        $.post('/api/v2/accounts', {
            'username': this.state.username,
            'password1': this.state.password,
            'password2': this.state.passwordCheck
        }).then(result => {
            if (result.ok)
                location.href = '/users/' + this.state.username + '/';
            else
                this.setState({
                    submitted: false,
                    errors: result.errors
                });
        });
    },
    _isValid() {
        return this.state.username.length > 0 &&
            this.state.username.length <= 30 &&
            this.state.username.match(/^[A-Za-z0-9_]+$/) &&
            this.state.password.length > 0 &&
            this.state.passwordCheck.length > 0 &&
            this.state.passwordCheck == this.state.password;
    }
});

module.exports = SignupRoute;
