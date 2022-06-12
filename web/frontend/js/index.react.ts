import * as Sentry from '@sentry/react';
import fetch from 'cross-fetch';
import { bootstrap, onPreloadDataReady } from 'nuri/client';
import nprogress from 'nprogress';
import app, { apolloCacheConfig } from './routes';
import { getCurrentUser, get } from './API';
import { trackPageView } from './Tracking';
import { Loader } from '../../shared/loader';
import '../less/nprogress.less';
import '../less/base.less';
import { config as faConfig } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { ApolloClient, DocumentNode, InMemoryCache, HttpLink } from '@apollo/client';
import { API } from './ApiClient';
faConfig.autoAddCss = false

if ((window as any).SENTRY_DSN) {
  Sentry.init({
    dsn: (window as any).SENTRY_DSN,
    ignoreErrors: ['hideGuidePopup'],
  });
}

if (process.env.NODE_ENV === 'development') {
  const { worker } = require('./mocks/browser')
  worker.start()
}

onPreloadDataReady(preloadData => {
  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(apolloCacheConfig).restore(preloadData.__APOLLO_STATE__),
    link: new HttpLink({
      uri: '/api/graphql',
      fetch,
    }),
  });

  // devtools
  (window as any).__APOLLO_CLIENT__ = apolloClient

  const loader: Loader = {
    callV4(path: string, params?: any) {
      return get('/api/v4' + path, params)
    },

    v5: API,

    getCurrentUser,

    graphql<T>(doc: DocumentNode, variables?: any): Promise<T> {
      return apolloClient.query<T>({
        fetchPolicy: 'network-only',
        query: doc,
        variables,
      }).then(result => result.data)
    },

    apolloClient,
  };

  bootstrap(app, loader, controller => {
    nprogress.configure({
      trickleRate: 0.4,
      trickleSpeed: 600,
      easing: 'ease',
    });

    controller.subscribe({
      willLoad() {
        nprogress.start();
      },
      didLoad() {
        nprogress.done();
      },
      didAbortLoad() {
        nprogress.done();
      },
      didCommitState() {
        trackPageView();
      },
    });
  });
});
