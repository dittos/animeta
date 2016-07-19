/* global _gaq */
/* global Raven */
import $ from 'jquery';
import {injectLoader, render} from 'nuri/client';
import nprogress from 'nprogress';
import app from './routes';
import '../less/nprogress.less';
import '../less/chart.less';
import '../less/work.less';
import '../less/signup.less';

injectLoader({
    call(path, params) {
        return $.get('/api/v2' + path, params);
    },

    getCurrentUser() {
        return $.ajax({url: '/api/v2/me', __silent__: true}).then(undefined, jqXHR => {
            var deferred = $.Deferred();
            if (jqXHR.statusCode)
                deferred.resolve(null);
            else
                deferred.reject(jqXHR);
            return deferred;
        });
    }
});

$(document).ajaxError((event, jqXHR, ajaxSettings, thrownError) => {
    if (ajaxSettings.__silent__)
        return;

    try {
        Raven.captureMessage(thrownError || jqXHR.statusText, {
            extra: {
                type: ajaxSettings.type,
                url: ajaxSettings.url,
                data: ajaxSettings.data,
                status: jqXHR.status,
                error: thrownError || jqXHR.statusText,
                response: jqXHR.responseText && jqXHR.responseText.substring(0, 100)
            }
        });
    } catch (e) {
        try {
            Raven.captureMessage(e);
        } catch (e2) {}
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

window.startApp = (preloadData) => {
    nprogress.configure({
        trickleRate: 0.4,
        trickleSpeed: 600,
        easing: 'ease',
    });

    const controller = render(app, document.getElementById('app'), preloadData);

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
            if (_gaq) {
                _gaq.push(['_trackPageview']);
            }
        },
    });
};
