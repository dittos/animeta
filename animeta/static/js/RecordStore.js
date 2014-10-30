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

exports.addPendingPost = function(id, post) {
    var record = get(id);
    if (!record.pendingPosts) {
        record.pendingPosts = [];
    }
    var context = {
        post: post
    };
    record.status = post.status;
    record.status_type = post.status_type;
    record.updated_at = +(new Date);
    record.pendingPosts.push(context);
    emitChange();
    return context;
};

exports.resolvePendingPost = function(context, updatedRecord, post) {
    var record = get(updatedRecord.id);
    for (var k in updatedRecord) {
        if (updatedRecord.hasOwnProperty(k))
            record[k] = updatedRecord[k];
    }
    record.pendingPosts = record.pendingPosts.filter(c => c !== context);
    if (record.pendingPosts.length == 0)
        delete record.pendingPosts;
    emitChange();
};
