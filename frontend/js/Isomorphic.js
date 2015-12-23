import React from 'react';
import {findDOMNode} from 'react-dom';

export function isContainer(Component) {
    return Component._isContainer;
}

export function createContainer(Component, options) {
    options.fetchData = options.fetchData || (async () => ({}));
    options.getPreloadKey = options.getPreloadKey || (() => null);

    class Container extends React.Component {
        componentDidUpdate() {
            this._updateFreshness();
        }

        componentDidMount() {
            this._updateFreshness();
        }

        render() {
            var preloadKey = options.getPreloadKey(this.props);
            var readyState = this.props.readyState;
            if (readyState && readyState[preloadKey] === 'loading') {
                return null;
            }
            var data = this.props.preloadData[preloadKey];
            return <Component {...this.props} {...data} />;
        }

        _updateFreshness() {
            var preloadKey = options.getPreloadKey(this.props);
            var readyState = this.props.readyState[preloadKey];
            var node = findDOMNode(this);
            if (node) {
                node.style.opacity = readyState === 'stale' ? 0.5 : 1.0;
            }
        }
    }
    Container._options = options;
    Container._isContainer = true;
    return Container;
}
