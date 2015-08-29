var Dispatcher = require('./Dispatcher');

export function connectService(serviceID) {
    Dispatcher.dispatch({
        type: 'connectService',
        serviceID
    });
}
