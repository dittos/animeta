var React = require('react');
var {plusOne} = require('../util');
var Styles = require('./StatusInput.less');

var StatusInputView = React.createClass({
    getDefaultProps() {
        return {
            minSize: 3,
            maxSize: 10
        };
    },

    render() {
        var {style, value, ...props} = this.props;
        var showSuffix = value.match(/^(|.*\d)$/);
        var width = Math.max(this.props.minSize, Math.min(this.props.maxSize, value.length)) + 'em';
        style = {...style, width, textAlign: 'right'};
        return <span>
            <input {...props}
                style={style}
                value={value}
                onChange={this._onChange}
                ref="input" />
            {showSuffix ? '화' : null}
            <span className={Styles.plus} style={{cursor: 'pointer'}} onClick={this._onClickPlus} />
        </span>;
    },

    _onChange(event) {
        if (this.props.onChange)
            this.props.onChange(event.target.value);
    },

    _onClickPlus(event) {
        event.preventDefault();
        this.props.onChange(plusOne(this.props.value));
    }
});

module.exports = StatusInputView;
