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
        const {Component, fetchData} = match.route;
        const request = {
            app,
            client: requestBoundClient,
            params: match.params,
        };
        Promise.resolve(fetchData(request)).then(data => {
            if (data.redirect)
                throw {_redirect: data.redirect};

            var {props, pageTitle = '', pageMeta = {}} = data;
            var html;
            if (prerender) {
                html = ReactDOMServer.renderToString(
                    <TempRouterProvider history={null}>
                        <Component {...props} />
                    </TempRouterProvider>
                );
            } else {
                html = '';
            }
            resolve({
                html,
                preloadData: {
                    routeProps: props,
                    cache,
                },
                title: pageTitle,
                meta: pageMeta
            });
        }).catch(e => reject(e));
    });
}
