var React = require('react');

var BLANK_IMG_URI = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

var blazy = null;
// Disable lazy loading on mobile browsers.
if (!/i(Phone|Pad|Pod)|Android|Safari/.test(navigator.userAgent)) {
    document.documentElement.className += ' b-fade';
    blazy = new Blazy;
}

var invalidations = null;
function invalidate() {
    if (!this.invalidation) {
        this.invalidation = setTimeout(() => {
            blazy.revalidate();
            this.invalidation = null;
        }, 0);
    }
}

var LazyImageView = blazy ? React.createClass({
    render: function() {
        return this.transferPropsTo(<img src={BLANK_IMG_URI} data-src={this.props.src}
            width={this.props.width} height={this.props.height} className="b-lazy" />);
    },

    componentDidMount() {
        invalidate();
    },

    componentDidUpdate() {
        invalidate();
    }
}) : React.DOM.img;

module.exports = LazyImageView;
