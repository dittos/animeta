var $ = require('jquery');

var _twitterConnectPromise = null;

export function connectTwitter() {
    return dispatch => {
        if (!_twitterConnectPromise) {
            _twitterConnectPromise = new Promise((resolve, reject) => {
                window.onTwitterConnect = ok => {
                    try {
                        if (ok) {
                            dispatch(connectedService('twitter'));
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
}

function connectedService(serviceID) {
    return {
        type: 'connectService',
        serviceID
    };
}

export function disconnectService(serviceID) {
    return dispatch => $.ajax({
        url: '/api/v2/me/external-services/' + serviceID,
        type: 'DELETE'
    }).then(() => {
        dispatch({
            type: 'disconnectService',
            serviceID
        });
    });
}
