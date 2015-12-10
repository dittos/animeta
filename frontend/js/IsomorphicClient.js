/* global _gaq */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Router} from 'react-router';
import {createHistory} from 'history';
import nprogress from 'nprogress';
import {injectClient, injectProgressListener} from './Isomorphic';
import 'style!css!nprogress/nprogress.css';

if (!process.env.CLIENT) {
    throw new Error('IsomorphicClient should be imported from browser side')
}

injectClient({
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

const fetches = new Set();

injectProgressListener({
    cancelFetch(id) {
        const deleted = fetches.delete(id);
        if (deleted && fetches.size === 0) {
            nprogress.done();
        }
    },
    startFetch(id) {
        fetches.add(id);
        if (fetches.size === 1) {
            nprogress.start();
        }
    },
    endFetch(id) {
        const deleted = fetches.delete(id);
        if (deleted && fetches.size === 0) {
            nprogress.done();
        }
    }
});

function createElementWithPreloadData(Component, props) {
    return <Component
        {...props}
        preloadData={global.PreloadData}
    />;
}

function onPageTransition() {
    if (_gaq) {
        _gaq.push(['_trackPageview']);
    }
}

export function render(routes) {
    const router = <Router
        history={createHistory()}
        createElement={createElementWithPreloadData}
        routes={routes}
        onUpdate={onPageTransition}
    />;
    ReactDOM.render(router, document.getElementById('app'));
}
