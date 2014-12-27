var events = require('events');
var _ = require('lodash');

var _events = new events.EventEmitter;
var _records = {};
var _pendingPostCount = 0;

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
    records.forEach(record => {
        _records[record.id] = record;
    });
    emitChange();
};

exports.getCount = function() {
    return _.size(_records);
};

exports.getCategoryStats = function() {
    return _.countBy(_records, record => record.category_id || 0);
};

exports.getStatusTypeStats = function() {
    return _.countBy(_records, 'status_type');
};

exports.query = function(statusType, categoryId, sortBy) {
    var chain = _(_records);
    if (statusType) {
        chain = chain.filter(record => record.status_type == statusType);
    }
    if (categoryId === 0 || categoryId) {
        chain = chain.filter(record => (record.category_id || 0) == categoryId);
    }
    chain = chain.values();
    if (sortBy == 'date') {
        chain = chain.sortBy('created_at').reverse();
    } else if (sortBy == 'title') {
        chain = chain.sortBy('title');
    }
    return chain.value();
};

exports.get = function(id) {
    return _records[id];
};

exports.updateTitle = function(id, title) {
    _records[id].title = title;
    emitChange();
};

exports.updateCategory = function(id, categoryId) {
    _records[id].category_id = categoryId;
    emitChange();
};

exports.addPendingPost = function(id, post) {
    var record = _records[id];
    if (!record.pendingPosts) {
        record.pendingPosts = [];
    }
    var context = {
        post: post
    };
    record.status = post.status;
    record.status_type = post.status_type;
    record.updated_at = +(new Date);
    record.has_newer_episode = false;
    record.pendingPosts.push(context);
    _pendingPostCount++;
    emitChange();
    return context;
};

exports.resolvePendingPost = function(context, updatedRecord, post) {
    var record = _records[updatedRecord.id];
    for (var k in updatedRecord) {
        if (updatedRecord.hasOwnProperty(k))
            record[k] = updatedRecord[k];
    }
    record.pendingPosts = record.pendingPosts.filter(c => c !== context);
    if (record.pendingPosts.length === 0)
        delete record.pendingPosts;
    _pendingPostCount--;
    emitChange();
};

exports.hasPendingPosts = function() {
    return _pendingPostCount > 0;
};

exports.add = function(record) {
    _records[record.id] = record;
    emitChange();
};
