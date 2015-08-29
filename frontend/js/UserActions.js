var Dispatcher = require('./Dispatcher');

export function loadCurrentUser(user) {
    Dispatcher.dispatch({
        type: 'loadCurrentUser',
        user: user
    });
}
