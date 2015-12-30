/* global _gaq */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {Router, RoutingContext} from 'react-router';
import {createHistory} from 'history';
import nprogress from 'nprogress';
import {isContainer} from './Isomorphic';
import dedupeClient from './dedupeClient';
import createStore from './store/createStore';
import 'nprogress/nprogress.css';

if (!process.env.CLIENT) {
    throw new Error('IsomorphicClient should be imported from browser side')
}

var client = dedupeClient({
    call(path, params) {
        return $.get('/api/v2' + path, params);
    },

    getCurrentUser() {
        return this.call('/me').then(undefined, jqXHR => {
            var deferred = $.Deferred();
            if (jqXHR.statusCode)
                deferred.resolve(null);
            else
                deferred.reject(jqXHR);
            return deferred;
        });
    }
});

function onPageTransition() {
    if (_gaq) {
        _gaq.push(['_trackPageview']);
    }
}

class IsomorphicRoutingContext extends React.Component {
    constructor(initialProps) {
        super(initialProps);
        this.state = {
            readyStates: null,
        };
        this._fetchID = 0;
        this._createElement = this._createElement.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        const store = this.context.store;
        const {components, routes} = nextProps;
        // assert(components.length === routes.length)
        const containers = [];
        components.forEach((component, index) => {
            if (!component || !isContainer(component)) {
                return;
            }

            const route = routes[index];
            containers.push({
                options: component._options,
                route
            });
        });

        client.clearCache();
        const readyStates = new WeakMap();
        const staleContainers = [];
        const freshContainers = [];
        containers.forEach(container => {
            const {options, route} = container;
            if (options.hasCachedData && options.hasCachedData(store.getState(), nextProps)) {
                readyStates.set(route, 'stale');
                staleContainers.push(container);
            } else {
                readyStates.set(route, 'loading');
                freshContainers.push(container);
            }
        });
        const fetchAllData = containers => Promise.all(containers.map(({options, route}) => {
            const promise = options.fetchData(store.getState, store.dispatch, nextProps);
            if (promise) {
                return promise.then(result => {
                    readyStates.set(route, '');
                    this.setState({readyStates});
                    return result;
                });
            }
        }));
        this.setState({readyStates});
        nprogress.start();

        var fetchID = ++this._fetchID;
        fetchAllData(freshContainers).then(
            () => fetchAllData(staleContainers)
        ).then(() => {
            if (this._fetchID !== fetchID) {
                // this fetch was aborted
                return;
            }
            var title = '';
            containers.forEach(({options}) => {
                const {getTitle} = options;
                if (getTitle) {
                    // Last title wins!
                    title = getTitle(title, store.getState(), nextProps);
                }
            });
            this.setState({readyStates: null}, () => {
                nprogress.done();
                if (title) {
                    title += ' - ';
                }
                document.title = title + '애니메타';
            });
        });
    }

    render() {
        return <RoutingContext
            {...this.props}
            createElement={this._createElement}
        />;
    }

    _createElement(Component, props) {
        var readyState;
        if (this.state.readyStates) {
            readyState = this.state.readyStates.get(props.route);
        }
        return <Component
            {...props}
            readyState={readyState}
        />;
    }
}

IsomorphicRoutingContext.contextTypes = {
    store: React.PropTypes.object
};

export function render(routes) {
    const router = <Router
        history={createHistory()}
        routes={routes}
        onUpdate={onPageTransition}
        RoutingContext={IsomorphicRoutingContext}
    />;
    const store = createStore(client, global.PreloadData.redux);
    ReactDOM.render(<Provider store={store}>{router}</Provider>, document.getElementById('app'));
}
