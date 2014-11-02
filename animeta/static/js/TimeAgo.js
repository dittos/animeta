/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');

var TimeAgo = React.createClass({
    render: function() {
        var m = moment(this.props.time);
        return <span title={m.format('llll')}>{m.fromNow()}</span>;
    },

    componentDidMount: function() {
        this._timer = setInterval(this.forceUpdate.bind(this), 60 * 1000);
    },

    componentWillUnmount: function() {
        if (this._timer) {
            clearInterval(this._timer);
        }
    }
});

module.exports = TimeAgo;
