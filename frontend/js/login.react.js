var React = require('react/addons');
var GlobalHeader = require('./GlobalHeader');
var LoginDialog = require('./LoginDialog');
require('../less/base.less');

var App = React.createClass({
    render() {
        return <div>
            <GlobalHeader currentUser={null} />
            <LoginDialog next="/" />
        </div>;
    }
});

React.render(
    <App />, 
    document.getElementById('app')
);
