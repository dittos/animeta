import React from 'react';
import ReactDOMServer from 'react-dom/server';
import createLocation from 'history/lib/createLocation';
import {match, RoutingContext} from 'react-router';
import {isContainer} from '../js/Isomorphic';

var _backend;

export function injectBackend(backend) {
    _backend = backend;
}

export function render(request, { routes }, prerender = false) {
    return new Promise((resolve, reject) => {
        const requestBoundClient = {
            call(path, params) {
                return _backend.call(request, path, params);
            },
            getCurrentUser() {
                return _backend.getCurrentUser(request);
            },
        };
        const location = createLocation(request.path);
        match({routes, location}, (error, redirectLocation, renderProps) => {
            // TODO: error check
            if (error) {
                console.trace(request, error, redirectLocation, renderProps);
                reject(error);
                return;
            }
            const containers = renderProps.components.filter(isContainer);
            Promise.all(containers
                .map(Container => Container._options.fetchData(requestBoundClient, renderProps))
            ).then(results => {
                const preloadData = {};
                var title = '';
                for (var i = 0; i < results.length; i++) {
                    const result = results[i];
                    const {getPreloadKey, getTitle} = containers[i]._options;
                    const key = getPreloadKey(renderProps);
                    if (key) {
                        preloadData[key] = result;
                    }
                    if (getTitle) {
                        // Last title wins!
                        title = getTitle(renderProps, result);
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
                resolve({html, preloadData, title});
            }).catch(e => reject(e));
        });
    });
}
