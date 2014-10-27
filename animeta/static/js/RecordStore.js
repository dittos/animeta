var events = require('events');

var _events = new events.EventEmitter;
var _records = [];

exports.addChangeListener = function(listener) {
    _events.on('change', listener);
};

exports.removeChangeListener = function(listener) {
    _events.removeListener('change', listener);
};

function emitChange() {
    _events.emit('change');
}

exports.preload = function(records) {
    _records = records;
    emitChange();
};

exports.getAll = function() {
    return _records;
};

var get = exports.get = function(id) {
    return _records.filter(record => record.id == id)[0];
};

exports.updateTitle = function(id, title) {
    get(id).title = title;
    emitChange();
};

exports.updateCategory = function(id, categoryId) {
    get(id).category_id = categoryId;
    emitChange();
};

exports.addPost = function(updatedRecord, post) {
    var record = get(updatedRecord.id);
    for (var k in updatedRecord) {
        if (updatedRecord.hasOwnProperty(k))
            record[k] = updatedRecord[k];
    }
    emitChange();
};
