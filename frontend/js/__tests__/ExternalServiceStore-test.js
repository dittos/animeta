var Immutable = require('immutable');
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

    it('save publish option when post is created', function() {
        var LocalStorage = require('../LocalStorage');
        callback({
            type: 'createPendingPost',
            publishOptions: Immutable.Set(['twitter'])
        });
        var publishOptions = ExternalServiceStore.getLastPublishOptions();
        expect(publishOptions.size).toBe(1);
        expect(publishOptions.has('twitter')).toBeTruthy();
        expect(LocalStorage.setItem).toBeCalledWith('publishTwitter', true);
        // off
        callback({
            type: 'createPendingPost',
            publishOptions: Immutable.Set()
        });
        var publishOptions = ExternalServiceStore.getLastPublishOptions();
        expect(publishOptions.size).toBe(0);
        expect(LocalStorage.setItem).toBeCalledWith('publishTwitter', false);
    });
});

describe('ExternalServiceStore + LocalStorage', function() {
    it('loads publish option from local storage (empty)', function() {
        var LocalStorage = require('../LocalStorage');
        var Dispatcher = require('../Dispatcher');
        var ExternalServiceStore = require('../ExternalServiceStore');
        var callback = Dispatcher.dispatch.bind(Dispatcher);
        var publishOptions = ExternalServiceStore.getLastPublishOptions();
        expect(publishOptions.size).toBe(0);
        expect(LocalStorage.getItem).toBeCalledWith('publishTwitter');
    });

    it('loads publish option from local storage', function() {
        var LocalStorage = require('../LocalStorage');
        LocalStorage.getItem.mockReturnValueOnce('true');
        var Dispatcher = require('../Dispatcher');
        var ExternalServiceStore = require('../ExternalServiceStore');
        var callback = Dispatcher.dispatch.bind(Dispatcher);
        var publishOptions = ExternalServiceStore.getLastPublishOptions();
        expect(publishOptions.size).toBe(1);
        expect(publishOptions.has('twitter')).toBeTruthy();
        expect(LocalStorage.getItem).toBeCalledWith('publishTwitter');
    });
});
