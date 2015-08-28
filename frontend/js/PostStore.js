var Dispatcher = require('./Dispatcher');
var {ReduceStore} = require('flux/utils');

var reducers = {
    loadRecordPosts(state, {recordID, posts}) {
        return {
            ...state,
            posts: {
                ...state.posts,
                [recordID]: posts
            }
        };
    },

    createPendingPost(state, {recordID, post, context}) {
        return {
            ...state,
            pendingPosts: {
                ...state.pendingPosts,
                [recordID]: [
                    {...post, tempID: context},
                    ...(state.pendingPosts[recordID] || [])
                ]
            },
            pendingPostCount: state.pendingPostCount + 1
        };
    },

    resolvePendingPost(state, {context, updatedRecord, post}) {
        const recordID = updatedRecord.id;
        return {
            ...state,
            pendingPosts: {
                ...state.pendingPosts,
                [recordID]: state.pendingPosts[recordID].filter(
                    post => post.tempID != context
                )
            },
            pendingPostCount: state.pendingPostCount - 1,
            posts: {
                ...state.posts,
                [recordID]: [post, ...state.posts[recordID]]
            }
        };
    },

    deleteRecord(state, {recordID}) {
        delete state.posts[recordID];
        delete state.pendingPosts[recordID];
        return state;
    },

    deletePost(state, {updatedRecord, postID}) {
        var recordID = updatedRecord.id;
        return {
            ...state,
            posts: {
                ...state.posts,
                [recordID]: state.posts[recordID].filter(post => post.id != postID)
            }
        };
    }
};

class PostStore extends ReduceStore {
    getInitialState() {
        return {
            posts: {},
            pendingPosts: {},
            pendingPostCount: 0
        };
    }

    findByRecordId(recordId) {
        var posts = this.getState().posts[recordId] || [];
        var pendingPosts = this.getState().pendingPosts[recordId] || [];
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
    }

    hasPendingPosts() {
        return this.getState().pendingPostCount > 0;
    }

    reduce(state, action) {
        const reducer = reducers[action.type];
        if (reducer)
            state = reducer(state, action);
        return state;
    }

    areEqual() {
        // Currently mutated in-place
        return false;
    }
}

module.exports = new PostStore(Dispatcher);
