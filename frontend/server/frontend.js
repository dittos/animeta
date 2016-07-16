import querystring from 'querystring';
import express from 'express';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import httpProxy from 'http-proxy';
import now from 'performance-now';
import serializeJS from 'serialize-javascript';
import ReactDOMServer from 'react-dom/server';
import Backend, {HttpNotFound} from './backend';
import renderFeed from './renderFeed';
import assetFilenames from '../assets.json';
import config from '../config.json';
import {render, injectLoaderFactory} from 'nuri/server';
import app from '../js/routes';

const DEBUG = process.env.NODE_ENV !== 'production';
const backend = new Backend(config.backend.baseUrl);
injectLoaderFactory(serverRequest => {
    serverRequest.loaderCalls = [];

    return {
        call(path, params) {
            const startTime = now();
            return backend.callRaw(serverRequest, path, params).then(({response, body}) => {
                const e2eTime = now() - startTime;
                serverRequest.loaderCalls.push({
                    path,
                    e2eTime,
                    time: parseFloat(response.headers['x-processing-time']) * 1000,
                });
                return body;
            });
        },
        getCurrentUser() {
            const startTime = now();
            return backend.getCurrentUser(serverRequest).then(r => {
                const e2eTime = now() - startTime;
                serverRequest.loaderCalls.push({path: '(currentUser)', e2eTime});
                return r;
            });
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

const proxy = httpProxy.createProxyServer({
    target: config.backend.baseUrl,
    changeOrigin: config.backend.remote ? true : false,
    cookieDomainRewrite: config.backend.remote ? '' : false,
});

proxy.on('proxyReq', (proxyReq, req, res, options) => {
    if (req.cookies.sessionid && !req.headers['x-animeta-session-key']) {
        proxyReq.setHeader('x-animeta-session-key', req.cookies.sessionid);
    }
});

server.use('/api', (req, res) => {
    proxy.web(req, res);
});

function renderDefault(res, locals, content, callback) {
    const context = {
        DEBUG,
        STATIC_URL: '/static/',
        ASSET_BASE: config.assetBase || '',
        assetFilenames,
        title: '',
        meta: {},
        stylesheets: [],
        scripts: [],
        checksum: null,
        serializeJS,

        ...locals,
    };

    function renderFooter() {
        server.render('footer', context, (err, footer) => {
            res.write('</div>' + footer);
            res.end();
        });
    }

    res.type('text/html');
    res.render('layout', context, (err, header) => {
        if (err) {
            if (callback) {
                callback(err);
                return;
            }
            throw err;
        }

        res.write(header + '<div id="app">');
        if (typeof content === 'string') {
            res.write(content);
            renderFooter();
        } else {
            // stream
            content.on('end', () => {
                context.checksum = content.checksum;
                renderFooter();
            }).pipe(res, {end: false});
        }
    });
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

server.get('/admin/', (req, res) => {
    renderDefault(res, {
        title: `Admin`,
        preloadData: {},
        stylesheets: [assetFilenames.admin.css],
        scripts: [assetFilenames.admin.js],
    }, '');
});

server.get('*', (req, res, next) => {
    const startTime = now();
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
            stylesheets: [assetFilenames.index.css],
            scripts: [assetFilenames.index.js],
        }, ReactDOMServer.renderToString(element), err => {
            next(err);
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
