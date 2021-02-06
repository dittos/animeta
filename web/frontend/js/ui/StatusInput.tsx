import * as React from 'react';
import { plusOne } from '../util';
import Styles from './StatusInput.less';

export class StatusInput extends React.Component<{
  value: string;
  onChange: (value: string) => any;
  style?: any;
  minSize?: number;
  maxSize?: number;
}> {
  render() {
    var { style, value, minSize = 3, maxSize = 10, ...props } = this.props;
    var showSuffix = value.match(/^(|.*\d)$/);
    var width =
      Math.max(minSize, Math.min(maxSize, value.length)) +
      'em';
    style = { ...style, width, textAlign: 'right' };
    return (
      <>
        <input
          {...props}
          style={style}
          value={value}
          onChange={this._onChange}
        />
        {showSuffix ? '화' : null}
        <span
          className={Styles.plus}
          style={{ cursor: 'pointer' }}
          onClick={this._onClickPlus}
        />
      </>
    );
  }

  _onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.onChange) this.props.onChange(event.target.value);
  };

  _onClickPlus = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    this.props.onChange(plusOne(this.props.value));
  };
}
