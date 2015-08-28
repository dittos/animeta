jest.dontMock('../Dispatcher');
jest.dontMock('../PostStore');
jest.dontMock('flux/lib/FluxStore');

describe('PostStore', function() {
    var PostStore;
    var callback;

    beforeEach(function() {
        var Dispatcher = require('../Dispatcher');
        PostStore = require('../PostStore');
        callback = Dispatcher.dispatch.bind(Dispatcher);
    });

    it('loads record posts', function() {
        callback({
            type: 'loadRecordPosts',
            recordID: 123,
            posts: [
                {id: 456}
            ]
        });
        var posts = PostStore.findByRecordId(123);
        expect(posts.length).toBe(1);
        expect(posts[0].id).toBe(456);
    });

    it('stores pending posts', function() {
        callback({
            type: 'loadRecordPosts',
            recordID: 123,
            posts: [
                {
                    id: 456,
                    status: 'status',
                    status_type: 'finished',
                    comment: ''
                }
            ]
        });
        expect(PostStore.hasPendingPosts()).toBeFalsy();
        
        var context = 12345;
        callback({
            type: 'createPendingPost',
            recordID: 123,
            post: {
                status: 'changed',
                status_type: 'finished',
                comment: 'comment'
            },
            context: context
        });
        var posts = PostStore.findByRecordId(123);
        expect(posts.length).toBe(2);
        expect(posts[0].tempID).toBe(context);
        expect(posts[1].id).toBe(456);
        expect(PostStore.hasPendingPosts()).toBeTruthy();

        var newUpdatedAt = Date.now() + 1000;
        callback({
            type: 'resolvePendingPost',
            context: context,
            updatedRecord: {
                id: 123,
                user_id: 456,
                work_id: 789,
                category_id: 123,
                status_type: 'finished',
                status: 'changed',
                title: 'blah blah',
                updated_at: newUpdatedAt,
            },
            post: {
                id: 999,
                user_id: 456,
                work_id: 789,
                status_type: 'finished',
                status: 'changed',
                created_at: newUpdatedAt
            }
        });
        var resolvedPosts = PostStore.findByRecordId(123);
        expect(resolvedPosts.length).toBe(2);
        expect(resolvedPosts[0].id).toBe(999);
        expect(resolvedPosts[1].id).toBe(456);
        expect(PostStore.hasPendingPosts()).toBeFalsy();
    });

    it('merges pending posts with saved posts', function() {
        var context = 12345;
        callback({
            type: 'createPendingPost',
            recordID: 123,
            post: {
                status: 'changed',
                status_type: 'finished',
                comment: 'comment'
            },
            context: context
        });
        callback({
            type: 'loadRecordPosts',
            recordID: 123,
            posts: [
                // This post will be merged with pending post
                {
                    id: 999,
                    status: 'changed',
                    status_type: 'finished',
                    comment: 'comment'
                },
                {
                    id: 456,
                    status: 'status',
                    status_type: 'finished',
                    comment: ''
                }
            ]
        });
        var posts = PostStore.findByRecordId(123);
        expect(posts.length).toBe(2);
        expect(posts[0].id).toBe(999);
        expect(posts[1].id).toBe(456);
    });

    it('deletes posts on record delete', function() {
        callback({
            type: 'loadRecordPosts',
            recordID: 123,
            posts: [
                {
                    id: 456,
                    status: 'status',
                    status_type: 'finished',
                    comment: ''
                }
            ]
        });
        var context = 12345;
        callback({
            type: 'createPendingPost',
            recordID: 123,
            post: {
                status: 'changed',
                status_type: 'finished',
                comment: 'comment'
            },
            context: context
        });
        callback({type: 'deleteRecord', recordID: 123});
        expect(PostStore.findByRecordId(123).length).toBe(0);
    });

    it('deletes post', function() {
        callback({
            type: 'loadRecordPosts',
            recordID: 123,
            posts: [{id: 456}, {id: 789}]
        });
        callback({
            type: 'deletePost',
            updatedRecord: {id: 123},
            postID: 456
        });
        var posts = PostStore.findByRecordId(123);
        expect(posts.length).toBe(1);
        expect(posts[0].id).toBe(789);
    });
});
