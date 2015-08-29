jest.dontMock('../Dispatcher');
jest.dontMock('../ExternalServiceStore');
jest.dontMock('flux/lib/FluxStore');

describe('ExternalServiceStore', function() {
    var ExternalServiceStore;
    var callback;

    beforeEach(function() {
        var Dispatcher = require('../Dispatcher');
        ExternalServiceStore = require('../ExternalServiceStore');
        callback = Dispatcher.dispatch.bind(Dispatcher);
    });

    it('loads connected services from user', function() {
        callback({
            type: 'loadCurrentUser',
            user: {
                connected_services: ['twitter']
            }
        });
        // Immutable.Set is returned
        var connectedServices = ExternalServiceStore.getConnectedServices();
        expect(connectedServices.size).toBe(1);
        expect(connectedServices.has('twitter')).toBeTruthy();
    });

    it('add newly connected service', function() {
        // init
        callback({
            type: 'loadCurrentUser',
            user: { }
        });
        // add
        callback({
            type: 'connectService',
            serviceID: 'twitter'
        });
        // Immutable.Set is returned
        var connectedServices = ExternalServiceStore.getConnectedServices();
        expect(connectedServices.size).toBe(1);
        expect(connectedServices.has('twitter')).toBeTruthy();
        // add another
        callback({
            type: 'connectService',
            serviceID: 'facebook'
        });
        connectedServices = ExternalServiceStore.getConnectedServices();
        expect(connectedServices.size).toBe(2);
        expect(connectedServices.has('twitter')).toBeTruthy();
        expect(connectedServices.has('facebook')).toBeTruthy();
        // add already connected once again
        callback({
            type: 'connectService',
            serviceID: 'facebook'
        });
        // unchanged
        expect(ExternalServiceStore.getConnectedServices()).toBe(connectedServices);
    });
});
