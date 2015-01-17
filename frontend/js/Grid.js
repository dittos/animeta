var React = require('react');

var Row = React.createClass({
    render() {
        return <div style={{
            ...this.props.style,
            marginLeft: 'auto',
            marginRight: 'auto',
            width: (getSpacing() * 2 + getColumnWidth()) * getColumns()
        }}>
            {this.props.children}
        </div>;
    }
});

var Column = React.createClass({
    render() {
        var {style, children, size, pull, ...props} = this.props;
        return <div {...props} style={{
            ...style,
            marginLeft: getSpacing(),
            marginRight: getSpacing(),
            width: (getSpacing() * 2 + getColumnWidth()) * size - getSpacing() * 2,
            'float': pull || 'none'
        }}>
            {children}
        </div>;
    }
});

function getSpacing() {
    return 10;
}

function getColumns() {
    return 12;
}

function getColumnWidth() {
    return 60;
}

module.exports = {
    Row,
    Column,
    getSpacing,
    getColumns,
    getColumnWidth
};
