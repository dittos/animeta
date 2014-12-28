var events = require('events');

var _events = new events.EventEmitter;
var _posts = {};
var _pendingPosts = {};
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

exports.findByRecordId = function(recordId) {
    var posts = _posts[recordId] || [];
    var pendingPosts = _pendingPosts[recordId] || [];
    if (pendingPosts) {
        // Exclude already saved pending posts
        pendingPosts = pendingPosts.filter(pendingPost => {
            var saved = false;
            posts.forEach(post => {
                if (pendingPost.status == post.status &&
                    pendingPost.status_type == post.status_type &&
                    pendingPost.comment == post.comment)
                    saved = true;
            });
            return !saved;
        });
    }
    return pendingPosts.concat(posts);
};

exports.loadRecordPosts = function(recordId, posts) {
    _posts[recordId] = posts;
    emitChange();
};

exports.createPendingPost = function(recordId, post, context) {
    if (!_pendingPosts[recordId])
        _pendingPosts[recordId] = [];
    _pendingPosts[recordId].unshift({...post, tempID: context});
    _pendingPostCount++;
    emitChange();
};

exports.resolvePendingPost = function(context, updatedRecord, post) {
    var recordId = updatedRecord.id;
    _pendingPosts[recordId] = _pendingPosts[recordId].filter(
        post => post.tempID != context
    );
    _pendingPostCount--;
    _posts[recordId].unshift(post);
    emitChange();
};

exports.hasPendingPosts = function() {
    return _pendingPostCount > 0;
};
