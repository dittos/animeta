import * as React from 'react';
import { findDOMNode } from 'react-dom';
import cx from 'classnames';

export class Sortable extends React.Component<{
  onDrop?(): void;
  onSwap(i: number, j: number): void;
  children: React.ReactElement[];
}> {
  render() {
    var items = React.Children.map(this.props.children, (child, i) => (
      <SortableItem
        component={child}
        key={typeof child === 'object' && child && 'key' in child ? child.key : i}
        order={i}
        onMoveUp={this._onMoveUp}
        onMoveDown={this._onMoveDown}
        onDrop={this.props.onDrop}
      />
    ));
    return <div>{items}</div>;
  }

  _onMoveUp = (i: number) => {
    if (i > 0) {
      this.props.onSwap(i, i - 1);
    }
  };

  _onMoveDown = (i: number) => {
    if (i < React.Children.count(this.props.children) - 1) {
      this.props.onSwap(i, i + 1);
    }
  };
}

type ItemProps = {
  order: number;
  component: React.ReactNode;
  onMoveUp(order: number): void;
  onMoveDown(order: number): void;
  onDrop?(): void;
};

class SortableItem extends React.Component<ItemProps> {
  _registeredEventListeners = false;

  state = {
    dragging: false,
    origTop: 0,
    origBottom: 0,
    holdY: 0,
    mouseY: 0,
  };

  componentDidUpdate(prevProps: ItemProps) {
    if (this.state.dragging && this.props.order != prevProps.order) {
      this._remeasure();
    }
    this._manageEventListeners(this.state.dragging);
  }

  componentWillUnmount() {
    this._manageEventListeners(false);
  }

  render() {
    var style: any = {};
    if (this.state.dragging) {
      style.position = 'relative';
      style.top = this.state.mouseY - this.state.origTop - this.state.holdY;
    }
    return (
      <div
        className={cx({
          draggable: true,
          dragging: this.state.dragging,
        })}
        style={style}
        onMouseDown={this._onMouseDown}
      >
        {this.props.component}
      </div>
    );
  }

  _manageEventListeners = (isDragging: boolean) => {
    var body = findDOMNode(this)!.ownerDocument;
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

  _onMouseDown = (event: React.MouseEvent) => {
    var bounds = (findDOMNode(this)! as Element).getBoundingClientRect();
    this.setState({
      dragging: true,
      origTop: bounds.top,
      origBottom: bounds.bottom,
      holdY: event.clientY - bounds.top,
      mouseY: event.clientY,
    });
  };

  _onMouseUp = () => {
    this.setState({ dragging: false });
    if (this.props.onDrop) {
      this.props.onDrop();
    }
  };

  _onMouseMove = (event: MouseEvent) => {
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
    this.setState({ mouseY: mouseY });
  };

  _remeasure = () => {
    var offset = this.state.mouseY - this.state.origTop - this.state.holdY;
    var bounds = (findDOMNode(this) as Element).getBoundingClientRect();
    this.setState({
      origTop: bounds.top - offset,
      origBottom: bounds.bottom - offset,
    });
  };
}
