import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {Provider} from 'react-redux';
import {match, RouterContext} from 'react-router';
import {HttpNotFound} from './backend';
import dedupeClient from '../js/dedupeClient';
import {isContainer} from '../js/Isomorphic';
import createStore from '../js/store/createStore';

var _backend;

export function injectBackend(backend) {
    _backend = backend;
}

export function render(request, routes, prerender = false) {
    return new Promise((resolve, reject) => {
        match({routes, location: request.path}, (error, redirectLocation, renderProps) => {
            // TODO: error check
            if (error) {
                console.trace(request, error, redirectLocation, renderProps);
                reject(error);
                return;
            }
            if (redirectLocation) {
                // TODO: support params, hash, ...
                throw {_redirect: redirectLocation.pathname};
            }
            if (!renderProps) {
                // No route matched.
                throw HttpNotFound;
            }
            const requestBoundClient = dedupeClient({
                call(path, params) {
                    return _backend.call(request, path, params);
                },
                getCurrentUser() {
                    return _backend.getCurrentUser(request);
                },
            });
            const store = createStore(requestBoundClient);
            const containers = renderProps.components.filter(c => c && isContainer(c));
            Promise.all(containers
                .map(Container => Container._options.fetchData(store.getState, store.dispatch, renderProps))
            ).then(() => {
                var title = '';
                var meta = {};
                const state = store.getState();
                containers.forEach(container => {
                    const {getTitle, getMeta} = container._options;
                    if (getTitle) {
                        // Last title wins!
                        title = getTitle(title, state, renderProps);
                    }
                    if (getMeta) {
                        // Last meta wins!
                        meta = getMeta(state, renderProps);
                    }
                });
                var html;
                if (prerender) {
                    html = ReactDOMServer.renderToString(
                        <Provider store={store}>
                            <RouterContext {...renderProps} />
                        </Provider>
                    );
                } else {
                    html = '';
                }
                resolve({html, preloadData: {redux: store.getState()}, title, meta});
            }).catch(e => reject(e));
        });
    });
}
