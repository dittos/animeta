import * as React from 'react';
import Styles from './Popover.less';

export interface PopoverProps {
  renderTrigger: (obj: { toggle: (event: React.MouseEvent) => any }) => React.ReactElement<any>;
  containerClassName?: string;
  relativeContainer?: boolean;
  contentClassName?: string;
}

interface PopoverState {
  show: boolean;
}

interface ContentProps {
  className?: string;
  onClose(): any;
}

class PopoverContent extends React.Component<ContentProps> {
  componentDidMount() {
    document.addEventListener('click', this.props.onClose, false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.props.onClose, false);
  }

  render() {
    return (
      <div className={`${Styles.popover} ${this.props.className || ''}`}>
        {this.props.children}
      </div>
    );
  }
}

export class Popover extends React.Component<PopoverProps, PopoverState> {
  state: PopoverState = {
    show: false,
  };

  render() {
    const { containerClassName, relativeContainer = true, contentClassName, renderTrigger, children } = this.props;
    const { show } = this.state;
    return (
      <div className={containerClassName} style={relativeContainer ? { position: 'relative' } : undefined}>
        {renderTrigger({ toggle: this._toggle })}
        {show && <PopoverContent className={contentClassName} onClose={this._close}>{children}</PopoverContent>}
      </div>
    );
  }

  _toggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation(); // prevent PopoverContent click handler trigger
    this.setState({ show: !this.state.show });
  };

  _close = () => {
    this.setState({ show: false });
  };
}
