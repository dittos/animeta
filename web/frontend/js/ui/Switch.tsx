import * as React from 'react';
import Styles from './Switch.module.less';

interface SwitchProps<T> {
  flex?: boolean;
  minimal?: boolean;
  value?: T;
  onChange?(value: T): void;
}

const SwitchContext = React.createContext<{
  value?: any;
  onChange?: any;
  minimal?: boolean;
} | null>(null);

export class Switch<T> extends React.Component<SwitchProps<T>> {
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

interface SwitchItemProps<T> {
  Component?: any;
  active?: boolean | null;
  value?: T;
  onClick?: (newValue: T | undefined) => boolean;
}

export class SwitchItem<T> extends React.Component<SwitchItemProps<T>, {}> {
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
