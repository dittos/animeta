import * as React from 'react';
import Styles from './Dropdown.module.less';
import { PopoverProps, Popover } from './Popover';

interface DropdownProps extends PopoverProps {
}

export class Dropdown extends React.Component<DropdownProps> {
  render() {
    const { contentClassName, ...props } = this.props;
    return <Popover contentClassName={`${Styles.dropdown} ${contentClassName || ''}`} {...props} />;
  }
}
