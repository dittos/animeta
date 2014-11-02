var events = require('events');

var _events = new events.EventEmitter;
var _posts = [];

exports.addChangeListener = function(listener) {
    _events.on('change', listener);
};

exports.removeChangeListener = function(listener) {
    _events.removeListener('change', listener);
};

function emitChange() {
    _events.emit('change');
}

exports.findByRecordId = function(recordId) {
    return _posts[recordId];
};

exports.loadRecordPosts = function(recordId, posts) {
    _posts[recordId] = posts;
    emitChange();
};

exports.addRecordPost = function(recordId, post) {
    _posts[recordId].unshift(post);
    emitChange();
};
