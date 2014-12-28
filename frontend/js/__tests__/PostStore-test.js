jest.dontMock('../PostStore');
jest.dontMock('object.assign');
Object.assign = require('object.assign');

describe('PostStore', function() {
    it('loads record posts', function() {
        var PostStore = require('../PostStore');
        PostStore.loadRecordPosts(123, [
            {id: 456}
        ]);
        var posts = PostStore.findByRecordId(123);
        expect(posts.length).toBe(1);
        expect(posts[0].id).toBe(456);
    });

    it('stores pending posts', function() {
        var PostStore = require('../PostStore');
        PostStore.loadRecordPosts(123, [
            {
                id: 456,
                status: 'status',
                status_type: 'finished',
                comment: ''
            }
        ]);
        expect(PostStore.hasPendingPosts()).toBeFalsy();
        
        var context = 12345;
        PostStore.createPendingPost(123, {
            status: 'changed',
            status_type: 'finished',
            comment: 'comment'
        }, context);
        var posts = PostStore.findByRecordId(123);
        expect(posts.length).toBe(2);
        expect(posts[0].tempID).toBe(context);
        expect(posts[1].id).toBe(456);
        expect(PostStore.hasPendingPosts()).toBeTruthy();

        var newUpdatedAt = Date.now() + 1000;
        PostStore.resolvePendingPost(context, {
            id: 123,
            user_id: 456,
            work_id: 789,
            category_id: 123,
            status_type: 'finished',
            status: 'changed',
            title: 'blah blah',
            updated_at: newUpdatedAt,
        }, {
            id: 999,
            user_id: 456,
            work_id: 789,
            status_type: 'finished',
            status: 'changed',
            created_at: newUpdatedAt
        });
        var resolvedPosts = PostStore.findByRecordId(123);
        expect(resolvedPosts.length).toBe(2);
        expect(resolvedPosts[0].id).toBe(999);
        expect(resolvedPosts[1].id).toBe(456);
        expect(PostStore.hasPendingPosts()).toBeFalsy();
    });

    it('merges pending posts with saved posts', function() {
        var PostStore = require('../PostStore');
        var context = 12345;
        PostStore.createPendingPost(123, {
            status: 'changed',
            status_type: 'finished',
            comment: 'comment'
        }, context);
        PostStore.loadRecordPosts(123, [
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
        ]);
        var posts = PostStore.findByRecordId(123);
        expect(posts.length).toBe(2);
        expect(posts[0].id).toBe(999);
        expect(posts[1].id).toBe(456);
    });
});
