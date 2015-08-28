var Dispatcher = require('./Dispatcher');
var {ReduceStore} = require('flux/utils');

var reducers = {
    loadCategories(_, {categories}) {
        return categories;
    },
    addCategory(_categories, {category}) {
        return _categories.concat([category]);
    },
    removeCategory(_categories, {categoryID}) {
        return _categories.filter(c => c.id != categoryID);
    },
    updateCategory(_categories, {category}) {
        for (var i = 0; i < _categories.length; i++) {
            if (_categories[i].id == category.id) {
                _categories[i] = category;
                break;
            }
        }
        return _categories;
    }
};

class CategoryStore extends ReduceStore {
    getInitialState() {
        return [];
    }

    getAll() {
        return this.getState();
    }

    reduce(state, action) {
        const reducer = reducers[action.type];
        if (reducer)
            state = reducer(state, action);
        return state;
    }

    areEqual() {
        // Currently mutated in-place
        return false;
    }
}

module.exports = new CategoryStore(Dispatcher);
