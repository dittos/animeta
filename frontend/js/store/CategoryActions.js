var $ = require('jquery');

function loadCategories(categories) {
    return {
        type: 'loadCategories',
        categories
    };
}

function addCategory(userName, categoryName) {
    return dispatch => $.post('/api/v2/users/' + userName + '/categories', {name: categoryName}).then(category => {
        dispatch({
            type: 'addCategory',
            category
        });
    });
}

function renameCategory(categoryID, categoryName) {
    return dispatch => $.ajax({
        url: '/api/v2/categories/' + categoryID,
        type: 'POST',
        data: {name: categoryName}
    }).then(category => {
        dispatch({
            type: 'updateCategory',
            category
        });
    });
}

function removeCategory(categoryID) {
    return dispatch => $.ajax({
        url: '/api/v2/categories/' + categoryID,
        type: 'DELETE'
    }).then(() => {
        dispatch({
            type: 'removeCategory',
            categoryID
        });
    });
}

function updateCategoryOrder(userName, categoryIDs) {
    return dispatch => $.ajax({
        url: '/api/v2/users/' + userName + '/categories',
        type: 'PUT',
        data: {ids: categoryIDs}
    }).then(categories => {
        // TODO: distinguish with initial load
        dispatch(loadCategories(categories));
    });
}

module.exports = {
    loadCategories,
    addCategory,
    removeCategory,
    renameCategory,
    updateCategoryOrder
};
