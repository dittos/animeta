var PostStore = require('./PostStore');
var RecordStore = require('./RecordStore');

var _pendingPostID = 0;

function fetchRecordPosts(recordID) {
    return $.get('/api/v2/records/' + recordID + '/posts').then(result => {
        PostStore.loadRecordPosts(recordID, result.posts);
    });
}

function createPost(recordID, post, publishOptions) {
    var context = _pendingPostID++;
    PostStore.createPendingPost(recordID, post, context);
    RecordStore.createPendingPost(recordID, post, context);
    // TODO: handle failure case
    return $.post('/api/v2/records/' + recordID + '/posts', {
        ...post,
        publish_twitter: publishOptions.twitter ? 'on' : 'off'
    }).then(result => {
        RecordStore.resolvePendingPost(context, result.record, result.post);
        PostStore.resolvePendingPost(context, result.record, result.post);
    });
}

module.exports = {
    fetchRecordPosts,
    createPost
};
