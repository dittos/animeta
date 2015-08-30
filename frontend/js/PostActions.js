var $ = require('jquery');
var Dispatcher = require('./Dispatcher');

var _pendingPostID = 0;

function fetchRecordPosts(recordID) {
    return $.get('/api/v2/records/' + recordID + '/posts').then(result => {
        Dispatcher.dispatch({
            type: 'loadRecordPosts',
            recordID: recordID,
            posts: result.posts
        });
    });
}

function createPost(recordID, post, publishOptions) {
    var context = _pendingPostID++;
    Dispatcher.dispatch({
        type: 'createPendingPost',
        recordID, post, context, publishOptions
    });
    // TODO: handle failure case
    return $.post('/api/v2/records/' + recordID + '/posts', {
        ...post,
        publish_twitter: publishOptions.has('twitter') ? 'on' : 'off'
    }).then(result => {
        Dispatcher.dispatch({
            type: 'resolvePendingPost',
            context: context,
            updatedRecord: result.record,
            post: result.post,
            publishOptions
        });
    });
}

function deletePost(postID) {
    return $.ajax({
        url: '/api/v2/posts/' + postID,
        type: 'DELETE'
    }).then(result => {
        Dispatcher.dispatch({
            type: 'deletePost',
            postID: postID,
            updatedRecord: result.record
        });
    });
}

module.exports = {
    fetchRecordPosts,
    createPost,
    deletePost
};
