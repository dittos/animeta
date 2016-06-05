/* global _gaq */
/* global Raven */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {createHistory, useQueries} from 'history';
import qs from 'querystring';
import {Observable} from 'rx';
import nprogress from 'nprogress';
import {matchRoute} from './Isomorphic';
import dedupeClient from './dedupeClient';
import TempRouterProvider from './TempRouterProvider';
import 'nprogress/nprogress.css';

if (!process.env.CLIENT) {
    throw new Error('IsomorphicClient should be imported from browser side')
}

function createClient() {
    return dedupeClient({
        call(path, params) {
            return $.get('/api/v2' + path, params);
        },

        getCurrentUser() {
            return $.ajax({url: '/api/v2/me', __silent__: true}).then(undefined, jqXHR => {
                var deferred = $.Deferred();
                if (jqXHR.statusCode)
                    deferred.resolve(null);
                else
                    deferred.reject(jqXHR);
                return deferred;
            });
        }
    });
}

function onPageTransition() {
    if (_gaq) {
        _gaq.push(['_trackPageview']);
    }
}

$(document).ajaxError((event, jqXHR, ajaxSettings, thrownError) => {
    if (ajaxSettings.__silent__)
        return;

    try {
        Raven.captureMessage(thrownError || jqXHR.statusText, {
            extra: {
                type: ajaxSettings.type,
                url: ajaxSettings.url,
                data: ajaxSettings.data,
                status: jqXHR.status,
                error: thrownError || jqXHR.statusText,
                response: jqXHR.responseText && jqXHR.responseText.substring(0, 100)
            }
        });
    } catch (e) {
        Raven.captureMessage(e);
    }
    if (jqXHR.responseText) {
        try {
            var err = $.parseJSON(jqXHR.responseText);
            alert(err.message);
            return;
        } catch (e) {
            // ignore
        }
    }
    alert('서버 오류로 요청에 실패했습니다.');
});

class History {
    constructor() {
        this._syncFromDOM();
        Rx.Observable.fromEvent(window, 'popstate')
            .subscribeOnNext(() => this._syncFromDOM());
    }

    getState() {
        return this.state;
    }

    setState(state) {
        this.state = state;
        window.history.replaceState({__isomorphic__: state}, '', this.path);
    }

    pushState(state, path) {
        this.path = path;
        this.state = state;
        window.history.pushState({__isomorphic__: state}, '', path);
    }

    _syncFromDOM() {
        this.path = window.location.pathname + window.location.search;
        this.state = window.history.state.__isomorphic__;
    }
}

export function render(app, container) {
    const history = new History();

    let Component;

    initialize();

    function initialize() {
        const match = matchRoute(app, window.location.pathname);
        if (!match) {
            // TODO: 404
            return;
        }
        const handler = match.route.handler;
        const request = {
            app,
            client: createClient(),
            params: match.params,
            query: qs.parse(window.location.search.substring(1)),
        };
        // TODO: initialRouteProps
        Promise.resolve(handler.model(request)).then(model => {
            history.setState(model);
            Component = handler.component;

            //ReactDOM.unmountComponentAtNode(container);
            renderView();
            listenForBackOrForwardNavigations();
        });
    }

    function setModel(updates) {
        const model = {
            ...history.getState(),
            ...updates
        };
        history.setState(model);
        renderView();
    }

    function visit(pathname) {
        // TODO: query support
        const match = matchRoute(app, pathname);
        if (!match) {
            // TODO: 404
            return;
        }
        const handler = match.route.handler;
        const request = {
            app,
            client: createClient(),
            params: match.params,
            query: {},
        };
        Promise.resolve(handler.model(request)).then(model => {
            history.pushState(model, pathname);
            Component = handler.component;

            ReactDOM.unmountComponentAtNode(container);
            renderView(() => { window.scrollTo(0, 0) });
        });
    }

    function listenForBackOrForwardNavigations() {
        Rx.Observable.fromEvent(window, 'popstate')
            .subscribeOnNext(() => {
                const match = matchRoute(app, window.location.pathname);
                if (!match) {
                    // TODO: 404
                    return;
                }

                const handler = match.route.handler;
                const model = history.getState();

                Component = handler.component;

                ReactDOM.unmountComponentAtNode(container);
                renderView();
            })
    }

    function renderView(done) {
        ReactDOM.render(
            <TempRouterProvider app={{visit}}>
                <Component
                    model={history.getState()}
                    setModel={setModel}
                />
            </TempRouterProvider>,
            container,
            done
        );
    }

    // TODO: nprogress
    // TODO: analytics
    // TODO: redirect
    // TODO: title
}
