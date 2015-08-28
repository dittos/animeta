jest.dontMock('../Dispatcher');
jest.dontMock('../CategoryStore');
jest.dontMock('flux/lib/FluxStore');

describe('CategoryStore', function() {
    var CategoryStore;
    var callback;

    function initStore() {
        callback({
            type: 'loadCategories',
            categories: [
                {id: 1, name: 'A'},
                {id: 2, name: 'B'}
            ]
        });
    }

    beforeEach(function() {
        var Dispatcher = require('../Dispatcher');
        CategoryStore = require('../CategoryStore');
        callback = Dispatcher.dispatch.bind(Dispatcher);
        initStore();
    });

    it('stores category', function() {
        var categories = CategoryStore.getAll();
        expect(categories.length).toBe(2);
        expect(categories[0].id).toBe(1);
        expect(categories[1].id).toBe(2);
    });

    it('adds category', function() {
        callback({
            type: 'addCategory',
            category: {id: 3, name: 'new'}
        });
        var categories = CategoryStore.getAll();
        expect(categories.length).toBe(3);
        expect(categories[0].id).toBe(1);
        expect(categories[1].id).toBe(2);
        expect(categories[2].id).toBe(3);
    });

    it('removes category', function() {
        callback({
            type: 'removeCategory',
            categoryID: 1
        });
        var categories = CategoryStore.getAll();
        expect(categories.length).toBe(1);
        expect(categories[0].id).toBe(2);
    });

    it('updates category name', function() {
        callback({
            type: 'updateCategory',
            category: {id: 2, name: 'new'}
        });
        var categories = CategoryStore.getAll();
        expect(categories.length).toBe(2);
        expect(categories[0].id).toBe(1);
        expect(categories[1].id).toBe(2);
        expect(categories[1].name).toBe('new');
    });
});
