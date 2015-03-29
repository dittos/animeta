var $ = require('jquery');
var React = require('react/addons');

var PositionSticky = React.createClass({
    mixins: [React.addons.PureRenderMixin],

    getInitialState() {
        return {sticky: false};
    },

    componentDidMount() {
        this.measure();
        $(window).scroll(this.handleScroll).resize(this.handleResize);
    },

    render() {
        var children = React.Children.map(this.props.children, child =>
            React.addons.cloneWithProps(child, {sticky: this.state.sticky})
        );
        if (!this.state.sticky) {
            return <div><div ref="content">{children}</div></div>;
        } else {
            return (
                <div>
                    <div ref="content" className="sticky"
                        style={{position: 'fixed', top: 0, left: this.state.left, right: this.state.right}}>
                        {children}
                    </div>
                    <div style={{height: this.state.height}} />
                </div>
            );
        }
    },

    handleScroll() {
        var nextSticky = $(window).scrollTop() > this._offsetTop;
        if (this.state.sticky != nextSticky) {
            this.setState({sticky: nextSticky});
        }
    },

    handleResize() {
        var wasSticky = this.state.sticky;
        this.setState({sticky: false}, () => {
            this.measure();
            this.setState({sticky: wasSticky});
        });
    },

    measure() {
        this._offsetTop = $(React.findDOMNode(this)).offset().top;

        var node = $(React.findDOMNode(this.refs.content));
        var left = node.position().left;
        var right = $('body').width() - (left + node.width());
        var height = node.height();
        this.setState({left: left, right: right, height: height});
    }
});

module.exports = PositionSticky;
