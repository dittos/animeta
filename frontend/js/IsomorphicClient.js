/* global _gaq */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Router, RoutingContext} from 'react-router';
import {createHistory} from 'history';
import nprogress from 'nprogress';
import {isContainer} from './Isomorphic';
import dedupeClient from './dedupeClient';
import 'nprogress/nprogress.css';

if (!process.env.CLIENT) {
    throw new Error('IsomorphicClient should be imported from browser side')
}

var client = {
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
};

function onPageTransition() {
    if (_gaq) {
        _gaq.push(['_trackPageview']);
    }
}

class IsomorphicRoutingContext extends React.Component {
    constructor(initialProps) {
        super(initialProps);
        this.state = {
            data: global.PreloadData,
            readyState: {}
        };
        this._createElement = this._createElement.bind(this);
        this._fetchID = 0;
    }

    componentWillReceiveProps(nextProps) {
        var containers = nextProps.components.filter(c => c && isContainer(c));
        var readyState = {};
        var staleData = {};
        var keys = containers.map(c => c._options.getPreloadKey(nextProps));
        keys.forEach(key => {
            var data = this.state.data[key];
            staleData[key] = data;
            readyState[key] = data ? 'stale' : 'loading';
        });
        this.setState({
            readyState,
            data: staleData
        });
        var fetchID = ++this._fetchID;
        nprogress.start();
        var wrappedClient = dedupeClient(client);
        Promise.all(containers.map(c => c._options.fetchData(wrappedClient, nextProps))).then(results => {
            if (this._fetchID !== fetchID) {
                // this fetch was aborted
                return;
            }
            const preloadData = {};
            var title = '';
            for (var i = 0; i < results.length; i++) {
                const result = results[i];
                const {getTitle} = containers[i]._options;
                const key = keys[i];
                if (key) {
                    preloadData[key] = result;
                }
                if (getTitle) {
                    // Last title wins!
                    title = getTitle(nextProps, result, title);
                }
            }
            this.setState({
                readyState: {},
                data: preloadData
            }, () => {
                for (var i = 0; i < results.length; i++) {
                    const result = results[i];
                    const {onLoad} = containers[i]._options;
                    if (onLoad)
                        onLoad(nextProps, result);
                }
                nprogress.done();
            });
            if (title) {
                title += ' - ';
            }
            document.title = title + '애니메타';
        });
    }

    render() {
        return <RoutingContext
            {...this.props}
            createElement={this._createElement}
        />;
    }

    _createElement(Component, props) {
        return <Component
            {...props}
            preloadData={this.state.data}
            readyState={this.state.readyState}
        />;
    }
}

export function render(routes) {
    const router = <Router
        history={createHistory()}
        routes={routes}
        onUpdate={onPageTransition}
        RoutingContext={IsomorphicRoutingContext}
    />;
    ReactDOM.render(router, document.getElementById('app'));
}
