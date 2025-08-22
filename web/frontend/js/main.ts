import * as Sentry from '@sentry/react';
import { bootstrap } from 'nuri/client';
import nprogress from 'nprogress';
import { graphql } from './API';
import { trackPageView } from './Tracking';
import { Loader } from '../../shared/loader';
import '../less/nprogress.less';
import '../less/base.less';
import { config as faConfig } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { API } from './ApiClient';
import { errorHandler } from './routes/errorHandler';
import { App } from 'nuri/app';
faConfig.autoAddCss = false

if ((window as any).SENTRY_DSN) {
  Sentry.init({
    dsn: (window as any).SENTRY_DSN,
    ignoreErrors: ['hideGuidePopup'],
  });
}

export function main(app: App<Loader>) {
  app.title = routeTitle => {
    return routeTitle + (routeTitle ? ' - ' : '') + '애니메타';
  };

  const loader: Loader = {
    v5: API,

    graphql,
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
}
