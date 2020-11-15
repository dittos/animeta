import React from 'react';
import * as Grid from './Grid';

export const Stack: React.SFC = ({ children }) => {
  return (
    <div style={{ position: 'relative' }}>
      {React.Children.map(
        children,
        child =>
          child &&
          React.isValidElement<{ style?: any }>(child) &&
          React.cloneElement(child, {
            style: {
              ...child.props.style,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            },
          })
      )}
    </div>
  );
}

export const CenteredFullWidth: React.SFC = ({ children, ...props }) => {
  return (
    <div {...props}>
      <Grid.Row>
        <Grid.Column size={Grid.getColumns()}>{children}</Grid.Column>
      </Grid.Row>
    </div>
  );
}
