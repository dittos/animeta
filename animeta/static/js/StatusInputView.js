/** @jsx React.DOM */

var React = require('react');
var AutoGrowInput = require('./AutoGrowInput');
var {plusOne} = require('./util');

var StatusInputView = React.createClass({
    getInitialState() {
        return {showSuffix: true};
    },

    render() {
        return <span>
            {this.transferPropsTo(<AutoGrowInput
                minSize={3} maxSize={10}
                style={{textAlign: 'right'}}
                onChange={this._onChange}
                ref="input" />)}
            {this.state.showSuffix ? '화' : null}
            <span className="plus-one" style={{cursor: 'pointer'}} onClick={this.handlePlusOne}>
                <img src="/static/plus.gif" alt="+1" />
            </span>
        </span>;
    },

    componentDidMount() {
        this._updateSuffix();
    },

    _updateSuffix() {
        var input = this.refs.input.getDOMNode();
        this.setState({showSuffix: input.value.match(/^(|.*\d)$/)});
    },

    _onChange(event) {
        this._updateSuffix();
        if (this.props.onChange)
            this.props.onChange(event.target.value);
    },

    handlePlusOne() {
        var input = this.refs.input.getDOMNode();
        var newValue = plusOne(input.value);
        input.value = newValue;
        if (this.props.onChange)
            this.props.onChange(newValue);
    }
});

module.exports = StatusInputView;
