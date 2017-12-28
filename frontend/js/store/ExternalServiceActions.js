var $ = require('jquery');
import _connectTwitter from '../connectTwitter';

export function connectTwitter() {
    return dispatch => _connectTwitter().then(() => {
        dispatch(connectedService('twitter'));
    });
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
