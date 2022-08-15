import * as Sentry from '@sentry/react';
import { bootstrap } from 'nuri/client';
import nprogress from 'nprogress';
import app from './routes';
import { getCurrentUser, get } from './API';
import { trackPageView } from './Tracking';
import { Loader } from '../../shared/loader';
import '../less/nprogress.less';
import '../less/base.less';
import { config as faConfig } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { API } from './ApiClient';
import request from 'graphql-request';
import { errorHandler } from './routes/errorHandler';
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

const loader: Loader = {
  callV4(path: string, params?: any) {
    return get('/api/v4' + path, params)
  },

  v5: API,

  getCurrentUser,

  graphql(doc, variables) {
    return request('/api/graphql', doc, variables)
  },
};

bootstrap(app, loader, errorHandler, controller => {
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
