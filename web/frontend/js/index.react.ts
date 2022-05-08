import $ from 'jquery';
import * as Sentry from '@sentry/react';
import fetch from 'cross-fetch';
import { bootstrap } from 'nuri/client';
import nprogress from 'nprogress';
import app from './routes';
import { getCurrentUser, serializeParams, toPromise } from './API';
import { trackPageView } from './Tracking';
import { Loader } from '../../shared/loader';
import '../less/nprogress.less';
import '../less/base.less';
import { config as faConfig } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { ApolloClient, DocumentNode, InMemoryCache, HttpLink } from '@apollo/client';
faConfig.autoAddCss = false

if ((window as any).SENTRY_DSN) {
  Sentry.init({
    dsn: (window as any).SENTRY_DSN,
    ignoreErrors: ['hideGuidePopup'],
  });
}

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: '/api/graphql',
    fetch,
  }),
});

const loader: Loader = {
  call(path: string, params?: any) {
    return toPromise($.get('/api/v2' + path, serializeParams(params)));
  },
  callV4(path: string, params?: any) {
    return toPromise($.get('/api/v4' + path, serializeParams(params)));
  },

  getCurrentUser,

  graphql<T>(doc: DocumentNode, variables?: any): Promise<T> {
    return apolloClient.query<T>({
      fetchPolicy: 'no-cache',
      query: doc,
      variables,
    }).then(result => result.data)
  },

  apolloClient,
};

$(document).ajaxError((event, jqXHR, ajaxSettings, thrownError) => {
  if (ajaxSettings.__silent__) return;

  try {
    Sentry.captureMessage(thrownError || jqXHR.statusText, {
      extra: {
        type: ajaxSettings.type,
        url: ajaxSettings.url,
        data: ajaxSettings.data,
        status: jqXHR.status,
        error: thrownError || jqXHR.statusText,
        response: jqXHR.responseText && jqXHR.responseText.substring(0, 100),
      },
    });
  } catch (e) {
    try {
      Sentry.captureException(e);
    } catch (e2) {
      // ignore
    }
  }
  if (jqXHR.responseText) {
    try {
      var err = $.parseJSON(jqXHR.responseText);
      alert(err.message);
      return;
    } catch (e) {
      // ignore
    }
  }
  alert('서버 오류로 요청에 실패했습니다.');
});

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
