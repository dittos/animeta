import * as React from 'react';
import Styles from './Switch.less';

interface SwitchProps {
  flex?: boolean;
  minimal?: boolean;
  value?: any;
  onChange?: any;
}

const SwitchContext = React.createContext<{
  value?: any;
  onChange?: any;
  minimal?: boolean;
} | null>(null);

export class Switch extends React.Component<SwitchProps> {
  render() {
    return (
      <div
        className={this.props.flex ? Styles.flexContainer : Styles.container}
      >
        <SwitchContext.Provider value={{
          value: this.props.value,
          onChange: this.props.onChange,
          minimal: this.props.minimal,
        }}>
          {this.props.children}
        </SwitchContext.Provider>
      </div>
    );
  }
}

interface SwitchItemProps {
  Component?: any;
  active?: boolean | null;
  value?: any;
  onClick?: (newValue: any) => any;
}

export class SwitchItem extends React.Component<SwitchItemProps, {}> {
  static contextType = SwitchContext;
  context!: React.ContextType<typeof SwitchContext>;

  render() {
    let {
      Component = 'a',
      active = null,
      value,
      onClick,
      ...props
    } = this.props;
    const context = this.context;
    if (!context) {
      throw new Error('<SwitchItem /> should be children of <Switch />');
    }
    if (active === null) {
      active = value === context.value;
    }
    let className = active ? Styles.activeItem : Styles.item;
    if (context.minimal) {
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
    if (this.context!.onChange) {
      this.context!.onChange(this.props.value);
    }
  };
}
