import * as React from 'react';
import * as PropTypes from 'prop-types';
import Styles from './Switch.less';

export class Switch extends React.Component {
  static childContextTypes = {
    switchValue: PropTypes.any,
    switchOnChange: PropTypes.any,
  };

  render() {
    return (
      <div
        className={this.props.flex ? Styles.flexContainer : Styles.container}
      >
        {this.props.children}
      </div>
    );
  }

  getChildContext() {
    return {
      switchValue: this.props.value,
      switchOnChange: this.props.onChange,
    };
  }
}

export class SwitchItem extends React.Component {
  static contextTypes = {
    switchValue: PropTypes.any,
    switchOnChange: PropTypes.any,
  };

  render() {
    let {
      Component = 'a',
      active = null,
      value,
      onClick,
      ...props
    } = this.props;
    if (active === null) {
      active = value === this.context.switchValue;
    }
    if (!onClick && this.context.switchOnChange) {
      onClick = e => {
        e.preventDefault();
        this.context.switchOnChange(value);
      };
    }
    return (
      <Component
        {...props}
        className={active ? Styles.activeItem : Styles.item}
        onClick={onClick}
      />
    );
  }
}
