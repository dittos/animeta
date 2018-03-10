import React from 'react';
import * as Grid from './Grid';

export function LeftRight({ left, right, style, ...props }) {
    return (
        <div
            {...props}
            style={{
                ...style,
            }}
        >
            <div style={{ float: 'left' }}>{left}</div>
            <div style={{ float: 'right' }}>{right}</div>
            <div style={{ clear: 'both' }} />
        </div>
    );
}

export function Stack({ children }) {
    return (
        <div style={{ position: 'relative' }}>
            {React.Children.map(
                children,
                child =>
                    child &&
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

export function CenteredFullWidth({ children, ...props }) {
    return (
        <div {...props}>
            <Grid.Row>
                <Grid.Column size={Grid.getColumns()}>{children}</Grid.Column>
            </Grid.Row>
        </div>
    );
}
