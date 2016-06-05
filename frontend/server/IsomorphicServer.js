import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {HttpNotFound} from './backend';
import dedupeClient from '../js/dedupeClient';
import {matchRoute} from '../js/Isomorphic';
import TempRouterProvider from '../js/TempRouterProvider';

var _backend;

export function injectBackend(backend) {
    _backend = backend;
}

export function render(app, serverRequest, prerender = false) {
    return new Promise((resolve, reject) => {
        const match = matchRoute(app, serverRequest.path);
        if (!match) {
            throw HttpNotFound;
        }
        const requestBoundClient = dedupeClient({
            call(path, params) {
                return _backend.call(serverRequest, path, params);
            },
            getCurrentUser() {
                return _backend.getCurrentUser(serverRequest);
            },
        });
        const {render, fetchData, renderTitle, renderMeta} = match.route.handler;
        const request = {
            app,
            client: requestBoundClient,
            params: match.params,
            query: serverRequest.query,
        };
        Promise.resolve(fetchData(request)).then(data => {
            if (data.redirect)
                throw {_redirect: data.redirect};

            var html;
            if (prerender) {
                html = ReactDOMServer.renderToString(
                    <TempRouterProvider history={null}>
                        {render(data)}
                    </TempRouterProvider>
                );
            } else {
                html = '';
            }
            resolve({
                html,
                preloadData: {
                    routeProps: prerender && data,
                },
                title: renderTitle && renderTitle(data),
                meta: renderMeta ? renderMeta(data) : {},
            });
        }).catch(e => reject(e));
    });
}
