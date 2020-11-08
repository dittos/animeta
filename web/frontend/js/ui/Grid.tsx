import React from 'react';

interface RowProps {
  className?: string;
}

export const Row: React.SFC<RowProps> = ({ className, children, ...props }) => {
  return (
    <div {...props} className={'grid-row ' + (className || '')}>
      {children}
    </div>
  );
}

interface ColumnProps {
  className?: string;
  size: number;
  midSize?: number;
  smallSize?: number;
  style?: React.CSSProperties;
  pull?: 'left' | 'right';
}

export const Column: React.SFC<ColumnProps> = ({
  className,
  children,
  size,
  midSize,
  smallSize,
  style,
  pull,
  ...props
}) => {
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

export function getColumns(): number {
  return 12;
}
