import querystring from 'querystring';
import express from 'express';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import httpProxy from 'http-proxy';
import serializeJS from 'serialize-javascript';
import isString from 'lodash/isString';
import Raven from 'raven';
import Backend, { HttpNotFound } from './backend';
import renderFeed from './renderFeed';
import config from './config.json';
import { render, injectLoaderFactory } from 'nuri/server';

const DEBUG = process.env.NODE_ENV !== 'production';
const MAINTENANCE = process.env.MAINTENANCE;
const backend = new Backend(config.backend.baseUrl);
if (config.sentryDsn) {
  Raven.config(config.sentryDsn).install();
}

function serializeParams(params) {
  if (!params) {
    return params;
  }
  const result = {};
  for (var k in params) {
    const v = params[k];
    result[k] = isString(v) ? v : JSON.stringify(v);
  }
  return result;
}

injectLoaderFactory(serverRequest => {
  return {
    call(path, params) {
      return backend.call(serverRequest, path, serializeParams(params));
    },
    getCurrentUser(params) {
      return backend.getCurrentUser(serverRequest, serializeParams(params));
    },
  };
});

export function createServer({ server = express(), appProvider, getAssets }) {
  server.set('view engine', 'ejs');
  server.set('views', __dirname);
  server.set('strict routing', true);
  server.set('etag', false);

  if (config.sentryDsn) {
    server.use(Raven.requestHandler());
  }
  if (config.staticUrl) {
    server.use('/static', (req, res) => res.redirect(config.staticUrl + req.path));
  } else {
    server.use('/static', express.static('static'));
  }
  server.use(cookieParser());
  server.use(csurf({ cookie: true }));
  server.use((req, res, next) => {
    res.cookie('crumb', req.csrfToken());
    next();
  });

  if (MAINTENANCE) {
    console.log('Starting in maintenance mode!');
    const maintenanceMessage = `서버 점검중입니다. (${MAINTENANCE} 완료 예정)`;
    server.get('/healthz', (req, res) => {
      res.send('ok');
    });
    server.use('/api', (req, res) => {
      res.status(503).json({
        message: maintenanceMessage,
      });
    });
    server.use((req, res) => {
      res.status(503).send(maintenanceMessage);
    });
    return server;
  }

  server.post('/api/fe/sessions', express.json(), (req, res) => {
    const cookieOptions = {
      path: '/',
      httpOnly: true,
    };
    if (config.sessionCookieDomain) {
      cookieOptions.domain = config.sessionCookieDomain;
    }
    if (req.body.transient === false) {
      cookieOptions.maxAge = 1000 * 60 * 60 * 24 * 14;
    }
    res.cookie('sessionid', req.body.session_key, cookieOptions);
    res.json({ ok: true });
  });
  server.delete('/api/fe/sessions', (req, res) => {
    const cookieOptions = {
      path: '/',
      httpOnly: true,
    };
    if (config.sessionCookieDomain) {
      cookieOptions.domain = config.sessionCookieDomain;
    }
    res.clearCookie('sessionid', cookieOptions);
    res.json({ ok: true });
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
      STATIC_URL: config.staticUrl || '/static',
      ASSET_BASE: config.assetBase || '',
      assets: getAssets(res),
      title: '',
      meta: {},
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
Allow: /table/
Disallow: /
`);
  });

  server.get('/healthz', (req, res) => {
    res.send('ok');
  });

  server.get('/support/', (req, res) => {
    res.render('support');
  });

  server.get('/library/', (req, res, next) => {
    backend
      .getCurrentUser(req)
      .then(currentUser => {
        if (!currentUser) {
          res.redirect('/login/');
        } else {
          res.redirect(`/users/${currentUser.name}/`);
        }
      })
      .catch(next);
  });

  server.get('/users/:username/history/:id/', (req, res) => {
    // TODO: check username
    res.redirect(`/-${req.params.id}`);
  });

  server.get('/users/:username/feed/', (req, res, next) => {
    const { username } = req.params;
    Promise.all([
      backend.call(req, `/users/${username}`),
      backend.call(req, `/users/${username}/posts`),
    ])
      .then(([owner, posts]) => {
        res
          .type('application/atom+xml; charset=UTF-8')
          .end(renderFeed(owner, posts));
      })
      .catch(next);
  });

  server.get('/admin/', (req, res) => {
    renderDefault(
      res,
      {
        title: `Admin`,
        preloadData: {},
        assetEntries: ['runtime', 'common', 'admin'],
      },
      ''
    );
  });

  server.use((req, res, next) => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    render(appProvider.get(), req)
      .then(result => {
        const {
          preloadData,
          title,
          meta,
          errorStatus,
          redirectURI,
          getHTML,
        } = result;

        if (errorStatus === 404) {
          throw HttpNotFound;
        }

        if (redirectURI) {
          res.redirect(redirectURI);
          return;
        }

        if (errorStatus) res.status(errorStatus);

        preloadData.kakaoApiKey = config.kakaoApiKey; // XXX
        renderDefault(
          res,
          {
            preloadData,
            title,
            meta,
            assetEntries: ['runtime', 'common', 'index'],
          },
          getHTML()
        );
      })
      .catch(err => {
        if (err === HttpNotFound) {
          next();
          return;
        }
        if (!(err instanceof Error)) {
          err = new Error(err);
        }
        next(err);
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
    if (
      path.match(
        /^\/(works|table|login|signup|settings|records|support|charts|users|library|compare)/
      ) &&
      !path.match(/\/$/)
    ) {
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
      backend
        .call(req, `/users/${username}`)
        .then(user => {
          res.redirect(`/users/${user.name}/`);
        })
        .catch(err => {
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

  if (config.sentryDsn) {
    server.use(Raven.errorHandler());
  }

  return server;
}