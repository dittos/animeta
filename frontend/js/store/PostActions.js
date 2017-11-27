var $ = require('jquery');

var _pendingPostID = 0;

function fetchRecordPosts(recordID) {
    return dispatch => $.get('/newapi/v2/records/' + recordID + '/posts').then(result => {
        dispatch({
            type: 'loadRecordPosts',
            recordID: recordID,
            posts: result.posts
        });
    });
}

function createPost(recordID, post, publishOptions) {
    return dispatch => {
        var context = _pendingPostID++;
        dispatch({
            type: 'createPendingPost',
            recordID, post, context, publishOptions
        });
        // TODO: handle failure case
        return $.post('/newapi/v2/records/' + recordID + '/posts', {
            ...post,
            publish_twitter: publishOptions.has('twitter') ? 'on' : 'off'
        }).then(result => {
            dispatch({
                type: 'resolvePendingPost',
                context: context,
                updatedRecord: result.record,
                post: result.post,
                publishOptions
            });
        });
    };
}

function deletePost(postID) {
    return dispatch => $.ajax({
        url: '/newapi/v2/posts/' + postID,
        type: 'DELETE'
    }).then(result => {
        dispatch({
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
