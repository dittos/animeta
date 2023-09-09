import qs from 'qs';
import express from 'express';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import httpProxy from 'http-proxy';
import serializeJS from 'serialize-javascript';
import * as Sentry from '@sentry/node';
import Backend, { HttpNotFound } from './backend';
import renderFeed from './renderFeed';
import { ServerRequest } from 'nuri/server';
import { AppProvider } from './AppProvider';
import { Loader } from '@animeta/web-shared/loader';
import * as ejs from 'ejs';

const DEBUG = process.env.NODE_ENV !== 'production';
const MAINTENANCE = process.env.MAINTENANCE;

export function createServer({ config, server = express(), appProvider, getAssets, staticDir }: {
  config: any;
  server?: express.Express;
  appProvider: AppProvider;
  getAssets: () => any;
  staticDir?: string;
}) {
  const backend = new Backend(config.backend.v4BaseUrl, config.backend.v5BaseUrl, config.backend.graphqlUrl);

  function loaderFactory(serverRequest: ServerRequest): Loader {
    return {
      v5: {
        call(path: string, params: any, options: any) {
          return backend.callV5(serverRequest, path, params);
        }
      },
      graphql(doc, variables) {
        return backend.graphql(serverRequest, doc, variables);
      },
    };
  }

  server.set('view engine', 'ejs');
  server.set('views', __dirname + '/views');
  server.set('strict routing', true);
  server.set('etag', false);

  // explicitly set for bundling
  server.engine('ejs', ejs.renderFile);

  if (config.sentryDsnNew) {
    server.use(Sentry.Handlers.requestHandler());
  }
  if (config.staticUrl) {
    server.use('/static', (req, res) => res.redirect(config.staticUrl + req.path));
  } else if (staticDir) {
    server.use('/static', express.static(staticDir));
  }
  server.use(cookieParser());

  const graphqlProxy = httpProxy.createProxyServer({
    target: config.backend.graphqlUrl,
    changeOrigin: config.backend.remote ? true : false,
    cookieDomainRewrite: config.backend.remote ? '' : false,
    ignorePath: true,
  });
  graphqlProxy.on('proxyReq', onProxyReq);
  graphqlProxy.on('error', onProxyError);

  server.use(csurf({ cookie: true }));
  function setCsrfCookie(req: express.Request, res: express.Response) {
    res.cookie('crumb', (req as any).csrfToken());
  }
  server.use('/api/graphql', (req, res) => {
    graphqlProxy.web(req, res);
  })

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
    const cookieOptions: express.CookieOptions = {
      path: '/',
      httpOnly: true,
    };
    if (config.sessionCookieDomain) {
      cookieOptions.domain = config.sessionCookieDomain;
    }
    const authResult = req.body.authResult;
    if (authResult.expiryMs) {
      cookieOptions.maxAge = authResult.expiryMs;
    }
    res.cookie('sessionid', authResult.sessionKey, cookieOptions);
    res.json({ ok: true });
  });
  server.delete('/api/fe/sessions', (req, res) => {
    const cookieOptions: express.CookieOptions = {
      path: '/',
      httpOnly: true,
    };
    if (config.sessionCookieDomain) {
      cookieOptions.domain = config.sessionCookieDomain;
    }
    res.clearCookie('sessionid', cookieOptions);
    res.json({ ok: true });
  });
  server.get('/api/fe/csrf-token', (req, res) => {
    setCsrfCookie(req, res);
    res.json({ ok: true });
  });

  function onProxyReq(proxyReq: any, req: express.Request, res: express.Response, options: any) {
    if (req.cookies.sessionid && !req.headers['x-animeta-session-key']) {
      proxyReq.setHeader('x-animeta-session-key', req.cookies.sessionid);
    }
  }
  function onProxyError(err: any, req: express.Request, res: express.Response) {
    console.error(err);
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('API error');
  }
  function configureProxy(pathPrefix: string, targetUrl: string, options?: {
    appendPathPrefixToTarget?: boolean;
    deprecationWarning?: boolean;
  }) {
    if (options?.appendPathPrefixToTarget) {
      targetUrl = targetUrl.replace(/\/$/, '') + pathPrefix;
    }
    const proxy = httpProxy.createProxyServer({
      target: targetUrl,
      changeOrigin: config.backend.remote ? true : false,
      cookieDomainRewrite: config.backend.remote ? '' : false,
    });
    proxy.on('proxyReq', onProxyReq);
    proxy.on('error', onProxyError);
    
    server.use(pathPrefix, (req, res) => {
      if (options?.deprecationWarning) {
        Sentry.captureMessage(`deprecated endpoint requested: ${req.method} ${req.path}`)
      }
      proxy.web(req, res);
    });
  }

  configureProxy('/api/v4', config.backend.v4BaseUrl, {deprecationWarning: true})
  configureProxy('/api/v5', config.backend.v5BaseUrl, {appendPathPrefixToTarget: true})
  configureProxy('/api/admin/v1', config.backend.adminNewBaseUrl2)

  function renderDefault(req: express.Request, res: express.Response, locals: any, content: string) {
    const context = {
      DEBUG,
      STATIC_URL: config.staticUrl || '/static',
      ASSET_BASE: config.assetBase || '',
      SENTRY_DSN: config.frontendSentryDsn || '',
      assets: getAssets(),
      title: '',
      meta: {},
      serializeJS,
      content,

      ...locals,
    };

    res.type('text/html');
    setCsrfCookie(req, res);
    res.render('layout', context);
  }

  server.get('/robots.txt', (req, res) => {
    res.set('content-type', 'text/plain');
    res.send(`User-agent: Twitterbot
Disallow:

User-Agent: *
Allow: /$
Allow: /table/
Disallow: /
`);
  });

  server.get('/favicon.ico', (req, res) => {
    res.sendStatus(404);
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
    backend.callV5(req, '/api/v5/UserFeed', {username})
      .then(data => {
        res
          .type('application/atom+xml; charset=UTF-8')
          .end(renderFeed(data.user, data.entries));
      })
      .catch(next);
  });

  server.get('/admin/', (req, res) => {
    renderDefault(
      req, res,
      {
        title: `Admin`,
        preloadData: {},
        assetEntries: ['admin'],
      },
      ''
    );
  });

  server.use((req, res, next) => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    // TODO: remove type assertion
    const {app, render} = appProvider.get()
    render(app, req as ServerRequest, loaderFactory(req as ServerRequest))
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
          req, res,
          {
            preloadData,
            title,
            meta,
            assetEntries: ['index'],
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
      var query = qs.stringify(req.query);
      if (query) {
        url += '?' + query;
      }
      res.redirect(url);
      return;
    }
    if (path.match(/^\/[\w.@+-]+$/) && !path.match(/^\/apple-touch-icon/)) {
      const username = path.substring(1);
      backend
        .callV5(req, '/api/v5/resolveSlug', {slug: username})
        .then(result => {
          if (result.type === 'USER') {
            res.redirect(`/users/${username}/`);
          } else {
            next();
          }
        })
        .catch(next);
      return;
    }
    next();
  });

  if (config.sentryDsnNew) {
    server.use(Sentry.Handlers.errorHandler());
  }

  return server;
}
