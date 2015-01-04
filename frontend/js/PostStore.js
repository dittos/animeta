var events = require('events');
var Dispatcher = require('./Dispatcher');

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

exports.hasPendingPosts = function() {
    return _pendingPostCount > 0;
};

var actions = {
    loadRecordPosts({recordID, posts}) {
        _posts[recordID] = posts;
        emitChange();
    },

    createPendingPost({recordID, post, context}) {
        if (!_pendingPosts[recordID])
            _pendingPosts[recordID] = [];
        _pendingPosts[recordID].unshift({...post, tempID: context});
        _pendingPostCount++;
        emitChange();
    },

    resolvePendingPost({context, updatedRecord, post}) {
        var recordID = updatedRecord.id;
        _pendingPosts[recordID] = _pendingPosts[recordID].filter(
            post => post.tempID != context
        );
        _pendingPostCount--;
        _posts[recordID].unshift(post);
        emitChange();
    },

    deleteRecord({recordID}) {
        delete _posts[recordID];
        delete _pendingPosts[recordID];
        emitChange();
    },

    deletePost({updatedRecord, postID}) {
        var recordID = updatedRecord.id;
        _posts[recordID] = _posts[recordID].filter(post => post.id != postID);
        emitChange();
    }
};

exports.dispatchToken = Dispatcher.register(payload => {
    var action = actions[payload.type];
    if (action)
        action(payload);
});
