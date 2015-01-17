var React = require('react');

var Row = React.createClass({
    render() {
        var {className, children, ...props} = this.props;
        return <div {...props} className={'grid-row ' + (className || '')}>
            {children}
        </div>;
    }
});

var Column = React.createClass({
    render() {
        var {className, children, size, smallSize, style, pull, ...props} = this.props;
        if (!className) className = '';
        if (!smallSize) smallSize = getColumns();
        className += ' grid-column-' + size;
        className += ' grid-column-sm-' + smallSize;
        return <div {...props}
            className={className}
            style={{...style, 'float': pull || 'none'}}>
            {children}
        </div>;
    }
});

function getColumns() {
    return 12;
}

module.exports = {
    Row,
    Column,
    getColumns
};
