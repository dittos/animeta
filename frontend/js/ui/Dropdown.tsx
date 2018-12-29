import * as React from 'react';
import Styles from './Dropdown.less';

interface DropdownProps {
  renderTrigger: (obj: { toggle: (event: React.MouseEvent) => any }) => React.ReactElement<any>;
  containerClassName?: string;
  menuClassName?: string;
}

interface DropdownState {
  show: boolean;
}

interface MenuProps {
  className?: string;
  onClose(): any;
}

class DropdownMenu extends React.Component<MenuProps> {
  componentDidMount() {
    document.addEventListener('click', this.props.onClose, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.props.onClose, false);
  }

  render() {
    return (
      <div className={`${Styles.dropdown} ${this.props.className || ''}`}>
        {this.props.children}
      </div>
    );
  }
}

export class Dropdown extends React.Component<DropdownProps, DropdownState> {
  state: DropdownState = {
    show: false,
  };

  render() {
    const { containerClassName, menuClassName, renderTrigger, children } = this.props;
    const { show } = this.state;
    return (
      <div className={containerClassName} style={{ position: 'relative' }}>
        {renderTrigger({ toggle: this._toggle })}
        {show && <DropdownMenu className={menuClassName} onClose={this._close}>{children}</DropdownMenu>}
      </div>
    );
  }

  _toggle = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState({ show: !this.state.show });
  };

  _close = () => {
    this.setState({ show: false });
  };
}
