import React from 'react';
import {connect} from 'react-redux';

export function isContainer(Component) {
    return Component._isContainer;
}

export function createContainer(Component, options) {
    if (options.select) {
        Component = connect(options.select, null, null, options.reduxOptions)(Component);
    }
    if (!options.fetchData) {
        options.fetchData = () => Promise.resolve();
    }

    class Container extends React.Component {
        render() {
            var {readyState, ...props} = this.props;
            if (readyState === 'loading') {
                return null;
            }
            return <Component {...props} />;
        }
    }
    Container._options = options;
    Container._isContainer = true;
    return Container;
}
