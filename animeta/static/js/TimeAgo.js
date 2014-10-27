/** @jsx React.DOM */

var React = require('react');
var moment = require('moment');
var SetIntervalMixin = require('react-components/js/set-interval-mixin.jsx');

var TimeAgo = React.createClass({
    mixins: [SetIntervalMixin],

    render: function() {
        var m = moment(this.props.time);
        return <span title={m.format('llll')}>{m.fromNow()}</span>;
    },

    componentDidMount: function() {
        var interval = this.props.time || 60000;
        this.setInterval(this.forceUpdate.bind(this), interval);
    }
});

module.exports = TimeAgo;
