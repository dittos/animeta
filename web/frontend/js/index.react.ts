import $ from 'jquery';
import * as Sentry from '@sentry/react';
import { bootstrap } from 'nuri/client';
import nprogress from 'nprogress';
import app from './routes';
import { getCurrentUser, serializeParams, toPromise } from './API';
import { trackPageView } from './Tracking';
import { Loader } from '../../shared/loader';
import '../less/nprogress.less';
import '../less/base.less';

if ((window as any).SENTRY_DSN) {
  Sentry.init({
    dsn: (window as any).SENTRY_DSN,
    ignoreErrors: ['hideGuidePopup'],
  });
}

const loader: Loader = {
  call(path: string, params?: any) {
    return toPromise($.get('/api/v2' + path, serializeParams(params)));
  },
  callV4(path: string, params?: any) {
    return toPromise($.get('/api/v4' + path, serializeParams(params)));
  },

  getCurrentUser,
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
