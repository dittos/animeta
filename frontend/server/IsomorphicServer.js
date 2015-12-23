import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {createLocation} from 'history';
import {match, RoutingContext} from 'react-router';
import {HttpNotFound} from './backend';
import dedupeClient from '../js/dedupeClient';
import {isContainer} from '../js/Isomorphic';

var _backend;

export function injectBackend(backend) {
    _backend = backend;
}

export function render(request, routes, prerender = false) {
    return new Promise((resolve, reject) => {
        const location = createLocation(request.path);
        match({routes, location}, (error, redirectLocation, renderProps) => {
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
            const containers = renderProps.components.filter(c => c && isContainer(c));
            Promise.all(containers
                .map(Container => Container._options.fetchData(requestBoundClient, renderProps))
            ).then(results => {
                const preloadData = {};
                var title = '';
                var meta = {};
                for (var i = 0; i < results.length; i++) {
                    const result = results[i];
                    const {getPreloadKey, getTitle, getMeta} = containers[i]._options;
                    const key = getPreloadKey(renderProps);
                    if (key) {
                        preloadData[key] = result;
                    }
                    if (getTitle) {
                        // Last title wins!
                        title = getTitle(renderProps, result);
                    }
                    if (getMeta) {
                        // Last meta wins!
                        meta = getMeta(renderProps, result);
                    }
                }
                var html;
                if (prerender) {
                    const createElement = (Component, props) => <Component {...props} preloadData={preloadData} />;
                    html = ReactDOMServer.renderToString(
                        <RoutingContext
                            {...renderProps}
                            createElement={createElement}
                        />
                    );
                } else {
                    html = '';
                }
                resolve({html, preloadData, title, meta});
            }).catch(e => reject(e));
        });
    });
}
