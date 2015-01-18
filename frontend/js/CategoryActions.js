var $ = require('jquery');
var Dispatcher = require('./Dispatcher');

function loadCategories(categories) {
    Dispatcher.dispatch({
        type: 'loadCategories',
        categories
    });
}

function addCategory(userName, categoryName) {
    return $.post('/api/v2/users/' + userName + '/categories', {name: categoryName}).then(category => {
        Dispatcher.dispatch({
            type: 'addCategory',
            category
        });
    });
}

function renameCategory(categoryID, categoryName) {
    return $.ajax({
        url: '/api/v2/categories/' + categoryID,
        type: 'POST',
        data: {name: categoryName}
    }).then(category => {
        Dispatcher.dispatch({
            type: 'updateCategory',
            category
        });
    });
}

function removeCategory(categoryID) {
    return $.ajax({
        url: '/api/v2/categories/' + categoryID,
        type: 'DELETE'
    }).then(() => {
        Dispatcher.dispatch({
            type: 'removeCategory',
            categoryID
        });
    });
}

function updateCategoryOrder(userName, categoryIDs) {
    return $.ajax({
        url: '/api/v2/users/' + userName + '/categories',
        type: 'PUT',
        data: {ids: categoryIDs}
    }).then(categories => {
        // TODO: distinguish with initial load
        loadCategories(categories);
    });
}

module.exports = {
    loadCategories,
    addCategory,
    removeCategory,
    renameCategory,
    updateCategoryOrder
};
