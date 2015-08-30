var Immutable = require('immutable');
var {MapStore} = require('flux/utils');
var Dispatcher = require('./Dispatcher');
var LocalStorage = require('./LocalStorage');

class ExternalServiceStore extends MapStore {
    getInitialState() {
        var lastPublishOptions = Immutable.Set();
        if (LocalStorage.getItem('publishTwitter') === 'true')
            lastPublishOptions = lastPublishOptions.add('twitter');
        return Immutable.Map()
            .set('connectedServices', Immutable.Set())
            .set('lastPublishOptions', lastPublishOptions);
    }

    getConnectedServices() {
        return this.getState().get('connectedServices');
    }

    getLastPublishOptions() {
        return this.getState().get('lastPublishOptions');
    }

    reduce(state, action) {
        switch (action.type) {
            case 'loadCurrentUser':
                return state.set('connectedServices', Immutable.Set(action.user.connected_services || []));
            case 'connectService':
                return state.update('connectedServices', services => services.add(action.serviceID));
            case 'createPendingPost':
                LocalStorage.setItem('publishTwitter', action.publishOptions.has('twitter'));
                return state.set('lastPublishOptions', action.publishOptions);
        }
        return state;
    }
}

module.exports = new ExternalServiceStore(Dispatcher);
