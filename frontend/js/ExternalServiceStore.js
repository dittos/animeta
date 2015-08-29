var Immutable = require('immutable');
var {MapStore} = require('flux/utils');
var Dispatcher = require('./Dispatcher');

class ExternalServiceStore extends MapStore {
    getConnectedServices() {
        return this.getState().get('connectedServices');
    }

    reduce(state, action) {
        switch (action.type) {
            case 'loadCurrentUser':
                return state.set('connectedServices', Immutable.Set(action.user.connected_services || []));
            case 'connectService':
                return state.update('connectedServices', services => services.add(action.serviceID));
        }
        return state;
    }
}

module.exports = new ExternalServiceStore(Dispatcher);
