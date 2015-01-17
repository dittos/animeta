var $ = require('jquery');
var React = require('react');
var Layout = require('./Layout');
var Grid = require('./Grid');

var DropdownUserMenu = React.createClass({
    componentDidMount() {
        $(document).on('click', this._onClose);
    },
    componentWillUnmount() {
        $(document).off('click', this._onClose);
    },
    render() {
        return <Grid.Column size={2} className="menu-user"
            onClick={e => e.stopPropagation()}>
            <a href="/library/">기록 관리</a>
            <a href="/settings/">설정</a>
            <a href="/logout/">로그아웃</a>
        </Grid.Column>;
    },
    _onClose() {
        this.props.onClose();
    }
});

var GlobalHeader = React.createClass({
    getInitialState() {
        return {showMenu: false};
    },
    render() {
        return <Layout.CenteredFullWidth className="header">
            <Layout.LeftRight className="header-inner"
                left={this._renderLeft()}
                right={this._renderRight()} />
        </Layout.CenteredFullWidth>;
    },
    _renderLeft() {
        return <div className="logo">
            <a href="/">animeta</a>
        </div>;
    },
    _renderRight() {
        var user = this.props.currentUser;
        if (user) {
            return <div className="account">
                <a href="/library/" className="btn btn-user"
                    onClick={this._toggleMenu}>
                    <i className="fa fa-user" />
                    {user.name}
                    <i className="fa fa-caret-down" />
                </a>
                {this.state.showMenu &&
                    <DropdownUserMenu
                        onClose={() => this.setState({showMenu: false})} />}
            </div>;
        } else {
            return <div className="account">
                <a href="/login/" className="btn btn-login">로그인</a>
                <a href="/signup/" className="btn btn-signup">회원 가입</a>
            </div>;
        }
    },
    _toggleMenu(event) {
        event.preventDefault();
        this.setState({showMenu: !this.state.showMenu});
    }
});

module.exports = GlobalHeader;
