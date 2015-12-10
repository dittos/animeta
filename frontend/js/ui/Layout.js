var React = require('react');
var Grid = require('./Grid');

var LeftRight = React.createClass({
    render() {
        var {left, right, style, ...props} = this.props;
        return <div {...props} style={{
            ...style
        }}>
            <div style={{'float': 'left'}}>
                {left}
            </div>
            <div style={{'float': 'right'}}>
                {right}
            </div>
            <div style={{'clear': 'both'}} />
        </div>;
    }
});

var Stack = React.createClass({
    render() {
        return <div style={{position: 'relative'}}>
            {React.Children.map(this.props.children, child =>
                child && React.cloneElement(child, {
                    style: {
                        ...child.props.style,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0
                    }
                }))}
        </div>;
    }
});

var CenteredFullWidth = React.createClass({
    render() {
        var {children, ...props} = this.props;
        return <div {...props}>
            <Grid.Row>
                <Grid.Column size={Grid.getColumns()}>
                    {children}
                </Grid.Column>
            </Grid.Row>
        </div>;
    }
});

module.exports = {
    Stack,
    LeftRight,
    CenteredFullWidth
};
