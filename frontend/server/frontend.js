import querystring from 'querystring';
import express from 'express';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import httpProxy from 'http-proxy';
import serializeJS from 'serialize-javascript';
import ReactDOMServer from 'react-dom/server';
import Backend, {HttpNotFound} from './backend';
import renderFeed from './renderFeed';
import config from '../config.json';
import {render, injectLoaderFactory} from 'nuri/server';
import app from '../js/routes';

const DEBUG = process.env.NODE_ENV !== 'production';
const backend = new Backend(config.backend.baseUrl);
injectLoaderFactory(serverRequest => {
    return {
        call(path, params) {
            return backend.call(serverRequest, path, params);
        },
        getCurrentUser() {
            return backend.getCurrentUser(serverRequest);
        },
    };
});

const server = express();
var getAssetFilenames;

server.set('view engine', 'ejs');
server.set('views', __dirname);
server.set('strict routing', true);
server.set('etag', false);

if (DEBUG) {
    server.use('/static', express.static(__dirname + '/../../animeta/static'));
}

server.use(cookieParser());
server.use(csurf({cookie: true}));
server.use((req, res, next) => {
    res.cookie('crumb', req.csrfToken());
    next();
});

function onProxyReq(proxyReq, req, res, options) {
    if (req.cookies.sessionid && !req.headers['x-animeta-session-key']) {
        proxyReq.setHeader('x-animeta-session-key', req.cookies.sessionid);
    }
}
function onProxyError(err, req, res) {
    console.error(err);
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('API error');
}

const proxy = httpProxy.createProxyServer({
    target: config.backend.baseUrl,
    changeOrigin: config.backend.remote ? true : false,
    cookieDomainRewrite: config.backend.remote ? '' : false,
});
proxy.on('proxyReq', onProxyReq);
proxy.on('error', onProxyError);

server.use('/api', (req, res) => {
    proxy.web(req, res);
});
server.use('/newapi', (req, res) => {
    proxy.web(req, res);
});

function renderDefault(res, locals, content) {
    const context = {
        DEBUG,
        STATIC_URL: '/static/',
        ASSET_BASE: config.assetBase || '',
        assetFilenames: getAssetFilenames(res),
        title: '',
        meta: {},
        checksum: null,
        serializeJS,
        content,

        ...locals,
    };

    res.type('text/html');
    res.render('layout', context);
}

server.get('/robots.txt', (req, res) => {
    res.set('content-type', 'text/plain');
    res.send(`User-Agent: *
Allow: /$
Disallow: /
`);
});

server.get('/support/', (req, res) => {
    res.render('support');
});

server.get('/library/', (req, res, next) => {
    backend.getCurrentUser(req).then(currentUser => {
        if (!currentUser) {
            res.redirect('/login/');
        } else {
            res.redirect(`/users/${currentUser.name}/`);
        }
    }).catch(next);
});

async function userHandler(req, res, username, currentUser) {
    if (!currentUser) {
        currentUser = await backend.getCurrentUser(req);
    }
    const [owner, records] = await Promise.all([
        backend.call(req, `/users/${username}`),
        backend.call(req, `/users/${username}/records`, {
            include_has_newer_episode: JSON.stringify(true)
        }),
    ]);
    const preloadData = {
        current_user: currentUser,
        owner,
        records
    };
    renderDefault(res, {
        title: `${owner.name} 사용자`,
        preloadData,
        assetEntries: ['common', 'library'],
    }, '');
}

function libraryHandler(req, res, next) {
    const {username} = req.params;
    userHandler(req, res, username).catch(next);
}

server.get('/users/:username/', libraryHandler);
server.get('/users/:username/history/', libraryHandler);
server.get('/users/:username/history/:id/', (req, res) => {
    // TODO: check username
    res.redirect(`/-${req.params.id}`);
});

server.get('/users/:username/feed/', (req, res, next) => {
    const {username} = req.params;
    Promise.all([
        backend.call(req, `/users/${username}`),
        backend.call(req, `/users/${username}/posts`),
    ]).then(([owner, posts]) => {
        res.type('application/atom+xml; charset=UTF-8')
            .end(renderFeed(owner, posts));
    }).catch(next);
});

function currentUserHandler(req, res, next) {
    backend.getCurrentUser(req).then(currentUser => {
        if (!currentUser) {
            res.redirect('/login/');
            return;
        }
        return userHandler(req, res, currentUser.name, currentUser);
    }).catch(next);
}

server.get('/records/add/*', currentUserHandler);
server.get('/records/category/', currentUserHandler);

function recordHandler(req, res, next) {
    backend.call(req, `/records/${req.params.id}`)
        .then(record => userHandler(req, res, record.user.name))
        .catch(next);
}

server.get('/records/:id/', recordHandler);
server.get('/records/:id/delete/', recordHandler); // TODO: remove

server.get('/admin/', (req, res) => {
    renderDefault(res, {
        title: `Admin`,
        preloadData: {},
        assetEntries: ['common', 'admin'],
    }, '');
});

server.get('*', (req, res, next) => {
    render(app, req).then(result => {
        const {preloadData, title, meta, errorStatus, redirectURI, element} = result;

        if (errorStatus === 404) {
            throw HttpNotFound;
        }

        if (redirectURI) {
            res.redirect(redirectURI);
            return;
        }

        if (errorStatus)
            res.status(errorStatus);

        preloadData.daum_api_key = config.daumAPIKey; // XXX
        renderDefault(res, {
            preloadData,
            title,
            meta,
            assetEntries: ['common', 'index'],
        }, ReactDOMServer.renderToString(element));
    }).catch(err => {
        if (err === HttpNotFound) {
            next();
            return;
        }
        if (!(err instanceof Error)) {
            err = new Error(err);
        }
        next(err)
    });
});

server.use((req, res, next) => {
    var path = req.path;
    // Strip slashes
    if (path.match(/\/{2,}/)) {
        path = path.replace(/\/{2,}/g, '/');
    }
    if (path.match(/^\/-(.+)\/$/)) {
        path = path.substring(0, path.length - 1);
    }
    // Add slashes
    if (path.match(/^\/(works|table|login|signup|settings|records|support|charts|users|library|compare)/) &&
        !path.match(/\/$/)) {
        path = path + '/';
    }
    if (path !== req.path) {
        var url = path;
        var query = querystring.stringify(req.query);
        if (query) {
            url += '?' + query;
        }
        res.redirect(url);
        return;
    }
    if (path.match(/^\/[\w.@+-]+$/) && !path.match(/^\/apple-touch-icon/)) {
        const username = path.substring(1);
        backend.call(req, `/users/${username}`).then(user => {
            res.redirect(`/users/${user.name}/`);
        }).catch(err => {
            if (err === HttpNotFound) {
                next();
            } else {
                next(err);
            }
        });
        return;
    }
    next();
});

if (DEBUG) {
    const webpack = require('webpack');
    const WebpackDevServer = require('webpack-dev-server');
    const webpackConfig = require('../../webpack.config.js');
    const wdsOptions = {
        serverSideRender: true,
        publicPath: '/static/build/',
        contentBase: false,
        host: 'localhost',
        port: 3000,
        inline: true,
    };
    WebpackDevServer.addDevServerEntrypoints(webpackConfig, wdsOptions);
    const compiler = webpack(webpackConfig);
    const wds = new WebpackDevServer(compiler, wdsOptions);
    wds.use(server);
    module.exports = wds;

    const {getAssets} = require('./assets');
    getAssetFilenames = function(res) {
        const statsObj = res.locals.webpackStats;
        if (!statsObj) {
            throw new Error('webpack-dev-middleware is unavailable');
        }
        return getAssets(compiler, statsObj);
    };
} else {
    module.exports = server;
    const assetFilenames = require('../assets.json');
    getAssetFilenames = function() {
        return assetFilenames;
    };
}