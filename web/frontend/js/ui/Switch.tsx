import * as React from 'react';
import * as PropTypes from 'prop-types';
import Styles from './Switch.less';

interface SwitchProps {
  flex?: boolean;
  minimal?: boolean;
  value: any;
  onChange: any;
}

export class Switch extends React.Component<SwitchProps> {
  static childContextTypes = {
    switchValue: PropTypes.any,
    switchOnChange: PropTypes.any,
    switchMinimal: PropTypes.bool,
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
      switchMinimal: this.props.minimal,
    };
  }
}

interface SwitchItemProps {
  Component?: any;
  active?: boolean | null;
  value: any;
  onClick?: (newValue: any) => any;
}

export class SwitchItem extends React.Component<SwitchItemProps> {
  static contextTypes = {
    switchValue: PropTypes.any,
    switchOnChange: PropTypes.any,
    switchMinimal: PropTypes.bool,
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
    let className = active ? Styles.activeItem : Styles.item;
    if (this.context.switchMinimal) {
      className = active ? Styles.activeItemMinimal : Styles.itemMinimal;
    }
    return (
      <Component
        {...props}
        className={className}
        onClick={this._onClick}
      />
    );
  }

  _onClick = (e: React.MouseEvent) => {
    if (this.props.Component === 'a') {
      e.preventDefault();
    }
    if (this.props.onClick) {
      if (this.props.onClick(this.props.value) === false){
        return;
      }
    }
    if (this.context.switchOnChange) {
      this.context.switchOnChange(this.props.value);
    }
  };
}
