var events = require('events');
var Dispatcher = require('./Dispatcher');

var _events = new events.EventEmitter;
var _categories = [];

exports.addChangeListener = function(listener) {
    _events.on('change', listener);
};

exports.removeChangeListener = function(listener) {
    _events.removeListener('change', listener);
};

function emitChange() {
    _events.emit('change');
}

exports.getAll = function() {
    return _categories;
};

var actions = {
    loadCategories({categories}) {
        _categories = categories;
        emitChange();
    },
    addCategory({category}) {
        _categories.push(category);
        emitChange();
    },
    removeCategory({categoryID}) {
        _categories = _categories.filter(c => c.id != categoryID);
        emitChange();
    },
    updateCategory({category}) {
        for (var i = 0; i < _categories.length; i++) {
            if (_categories[i].id == category.id) {
                _categories[i] = category;
                emitChange();
                return;
            }
        }
    }
};

exports.dispatchToken = Dispatcher.register(payload => {
    var action = actions[payload.type];
    if (action)
        action(payload);
});
