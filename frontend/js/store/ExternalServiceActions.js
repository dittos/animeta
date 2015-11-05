var $ = require('jquery');
var Dispatcher = require('./Dispatcher');

var _twitterConnectPromise = null;

export function connectTwitter() {
    if (!_twitterConnectPromise) {
        _twitterConnectPromise = new Promise((resolve, reject) => {
            window.onTwitterConnect = ok => {
                try {
                    if (ok) {
                        connectedService('twitter');
                        resolve();
                    } else {
                        alert('연동 실패. 잠시 후 다시 시도해주세요.');
                        reject();
                    }
                } finally {
                    window.onTwitterConnect = null;
                    _twitterConnectPromise = null;
                }
            };
            window.open('/api/v2/me/external-services/twitter/connect');
        });
    }
    return _twitterConnectPromise;
}

function connectedService(serviceID) {
    Dispatcher.dispatch({
        type: 'connectService',
        serviceID
    });
}

export function disconnectService(serviceID) {
    return $.ajax({
        url: '/api/v2/me/external-services/' + serviceID,
        type: 'DELETE'
    }).then(() => {
        Dispatcher.dispatch({
            type: 'disconnectService',
            serviceID
        });
    });
}
