var Immutable = require('immutable');
var LocalStorage = require('../LocalStorage');

function reducer(state, action) {
    if (!state) {
        var lastPublishOptions = Immutable.Set();
        if (LocalStorage.getItem('publishTwitter') === 'true')
            lastPublishOptions = lastPublishOptions.add('twitter');
        state = Immutable.Map()
            .set('connectedServices', Immutable.Set())
            .set('lastPublishOptions', lastPublishOptions);
    }

    switch (action.type) {
        case 'loadCurrentUser':
            return state.set('connectedServices', Immutable.Set(action.user.connected_services || []));
        case 'connectService':
            return state.update('connectedServices', services => services.add(action.serviceID));
        case 'disconnectService':
            return state.update('connectedServices', services => services.remove(action.serviceID));
        case 'createPendingPost':
            LocalStorage.setItem('publishTwitter', action.publishOptions.has('twitter'));
            return state.set('lastPublishOptions', action.publishOptions);
    }
    return state;
}

module.exports = Object.assign(reducer, {
    getConnectedServices(state) {
        return state.externalService.get('connectedServices');
    },

    getLastPublishOptions(state) {
        return state.externalService.get('lastPublishOptions');
    }
});
