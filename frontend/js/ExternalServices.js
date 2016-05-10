import Immutable from 'immutable';
import LocalStorage from './LocalStorage';

var _twitterConnectPromise = null;

export function connectTwitter() {
    if (!_twitterConnectPromise) {
        _twitterConnectPromise = new Promise((resolve, reject) => {
            window.onTwitterConnect = ok => {
                try {
                    if (ok) {
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

export function getLastPublishOptions() {
    var lastPublishOptions = Immutable.Set();
    if (LocalStorage.getItem('publishTwitter') === 'true')
        lastPublishOptions = lastPublishOptions.add('twitter');
    return lastPublishOptions;
}

export function setLastPublishOptions(publishOptions) {
    LocalStorage.setItem('publishTwitter', publishOptions.has('twitter'));
}
