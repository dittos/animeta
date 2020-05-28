import React from 'react';

export function Row({ className, children, ...props }) {
  return (
    <div {...props} className={'grid-row ' + (className || '')}>
      {children}
    </div>
  );
}

export function Column({
  className,
  children,
  size,
  midSize,
  smallSize,
  style,
  pull,
  ...props
}) {
  if (!className) className = '';
  if (!midSize) midSize = size;
  if (!smallSize) smallSize = getColumns();
  className += ' grid-column-' + size;
  className += ' grid-column-md-' + midSize;
  className += ' grid-column-sm-' + smallSize;
  return (
    <div
      {...props}
      className={className}
      style={{ ...style, float: pull || 'none' }}
    >
      {children}
    </div>
  );
}

export function getColumns() {
  return 12;
}
