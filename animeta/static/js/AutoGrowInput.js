var React = require('react');

var AutoGrowInput = React.createClass({
    getInitialState() {
        return {size: this.props.minSize};
    },

    componentDidMount() {
        this.setState({size: this.getDOMNode().value.length});
    },

    render() {
        var width = Math.max(this.props.minSize, Math.min(this.props.maxSize, this.state.size)) + 'em';
        return this.transferPropsTo(<input onChange={this.handleChange} style={{width: width}} />);
    },

    handleChange(event) {
        this.setState({size: event.target.value.length});
        if (this.props.onChange)
            this.props.onChange(event);
    }
});

module.exports = AutoGrowInput;
