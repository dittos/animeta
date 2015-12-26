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
        return _categories.slice();
    }
};

function categoryReducer(state = [], action) {
    const reducer = reducers[action.type];
    if (reducer)
        return reducer(state, action);
    return state;
}

module.exports = Object.assign(categoryReducer, {
    getAll(state) {
        return state.category;
    }
});
