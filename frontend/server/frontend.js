import querystring from 'querystring';
import express from 'express';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import httpProxy from 'http-proxy';
import now from 'performance-now';
import Backend, {HttpNotFound} from './backend';
import renderFeed from './renderFeed';
import assetFilenames from '../assets.json';
import config from '../config.json';
import {render, injectLoaderFactory} from 'nuri/server';
import app from '../js/routes';

const DEBUG = process.env.NODE_ENV !== 'production';
const backend = new Backend(config.backend);
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

const proxy = httpProxy.createProxyServer({});
server.use('/api', (req, res) => {
    proxy.web(req, res, {target: `http://${config.backend.host}:${config.backend.port}/api`});
});

function renderDefault(res, locals, callback) {
    res.render('layout', {
        DEBUG,
        STATIC_URL: '/static/',
        assetFilenames,
        title: '',
        meta: {},
        stylesheets: [],
        scripts: [],

        ...locals,
    }, callback);
}

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
        html: '',
        title: `${owner.name} 사용자`,
        preloadData,
        stylesheets: [assetFilenames.library.css],
        scripts: [assetFilenames.library.js],
    });
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
server.get('/records/:id/delete/', recordHandler);

server.get('*', (req, res, next) => {
    const startTime = now();
    render(app, req).then(result => {
        const renderedTime = now();

        const {preloadData, title, meta, errorStatus, redirectURI} = result;

        if (errorStatus === 404) {
            throw HttpNotFound;
        }

        if (redirectURI) {
            res.redirect(redirectURI);
            return;
        }

        if (errorStatus)
            res.status(errorStatus);

        const html = result.getHTML();
        const htmlRenderedTime = now();

        preloadData.daum_api_key = config.daumAPIKey; // XXX
        renderDefault(res, {
            html,
            preloadData,
            title,
            meta,
            stylesheets: [assetFilenames.index.css],
            scripts: [assetFilenames.index.js],
        }, (err, html) => {
            if (err) {
                next(err);
                return;
            }
            const templateRenderedTime = now();
            res.send(html + `<!--
nuri: ${(renderedTime - startTime).toFixed(3)}ms
react: ${(htmlRenderedTime - renderedTime).toFixed(3)}ms
ejs: ${(templateRenderedTime - htmlRenderedTime).toFixed(3)}ms
-->`);
        });
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
    if (path.match(/^\/[\w.@+-]+$/)) {
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

module.exports = server;
