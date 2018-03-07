var React = require('react');
var ReactDOM = require('react-dom');
var cx = require('classnames');

class Sortable extends React.Component {
    render() {
        var i = 0;
        var items = React.Children.map(this.props.children, child =>
            <SortableItem
                component={child}
                key={child.key}
                order={i++}
                onMoveUp={this._onMoveUp}
                onMoveDown={this._onMoveDown}
                onDrop={this.props.onDrop} />
        );
        return <div>{items}</div>;
    }

    _onMoveUp = (i) => {
        if (i > 0) {
            this.props.onSwap(i, i - 1);
        }
    };

    _onMoveDown = (i) => {
        if (i < React.Children.count(this.props.children) - 1) {
            this.props.onSwap(i, i + 1);
        }
    };
}

class SortableItem extends React.Component {
    state = {dragging: false};

    componentDidUpdate(prevProps) {
        if (this.state.dragging && this.props.order != prevProps.order) {
            this._remeasure();
        }
        this._manageEventListeners(this.state.dragging);
    }

    componentWillUnmount() {
        this._manageEventListeners(false);
    }

    render() {
        var style = {};
        if (this.state.dragging) {
            style.position = 'relative';
            style.top = this.state.mouseY - this.state.origTop - this.state.holdY;
        }
        return <div className={cx({draggable: true, dragging: this.state.dragging})}
            style={style}
            onMouseDown={this._onMouseDown}>
                {this.props.component}
            </div>;
    }

    _manageEventListeners = (isDragging) => {
        var body = ReactDOM.findDOMNode(this).ownerDocument;
        if (isDragging && !this._registeredEventListeners) {
            body.addEventListener('mousemove', this._onMouseMove);
            body.addEventListener('mouseup', this._onMouseUp);
            this._registeredEventListeners = true;
        } else if (!isDragging && this._registeredEventListeners) {
            body.removeEventListener('mousemove', this._onMouseMove);
            body.removeEventListener('mouseup', this._onMouseUp);
            this._registeredEventListeners = false;
        }
    };

    _onMouseDown = (event) => {
        var bounds = ReactDOM.findDOMNode(this).getBoundingClientRect();
        this.setState({
            dragging: true,
            origTop: bounds.top,
            origBottom: bounds.bottom,
            holdY: event.clientY - bounds.top,
            mouseY: event.clientY
        });
    };

    _onMouseUp = () => {
        this.setState({dragging: false});
        if (this.props.onDrop) {
            this.props.onDrop();
        }
    };

    _onMouseMove = (event) => {
        if (!this.state.dragging) {
            return;
        }
        var mouseY = event.clientY;
        var offset = mouseY - this.state.origTop - this.state.holdY;
        var currentBottom = this.state.origBottom + offset;
        if (currentBottom < this.state.origTop) {
            this.props.onMoveUp(this.props.order);
        }
        var currentTop = this.state.origTop + offset;
        if (this.state.origBottom < currentTop) {
            this.props.onMoveDown(this.props.order);
        }
        this.setState({mouseY: mouseY});
    };

    _remeasure = () => {
        var offset = this.state.mouseY - this.state.origTop - this.state.holdY;
        var bounds = ReactDOM.findDOMNode(this).getBoundingClientRect();
        this.setState({
            origTop: bounds.top - offset,
            origBottom: bounds.bottom - offset
        });
    };
}

module.exports = Sortable;
