jest.dontMock('../RecordStore');

function newStore() {
    var RecordStore = require('../RecordStore');
    RecordStore.preload([
        {
            id: 123,
            user_id: 456,
            work_id: 789,
            category_id: 123,
            status_type: 'watching',
            status: 'test',
            title: 'blah blah',
            updated_at: Date.now(),
            has_newer_episode: true
        }
    ]);
    return RecordStore;
}

describe('RecordStore', function() {
    it('find all records', function() {
        var RecordStore = newStore();
        var records = RecordStore.getAll();
        expect(records.length).toBe(1);
        expect(records[0].id).toBe(123);
    });

    it('find one record by id', function() {
        var RecordStore = newStore();
        var record = RecordStore.get(123);
        expect(record.id).toBe(123);
        expect(record.title).toBe('blah blah');
    });

    it('updates title', function() {
        var RecordStore = newStore();
        RecordStore.updateTitle(123, 'changed');
        expect(RecordStore.get(123).title).toBe('changed');
    });

    it('updates category', function() {
        var RecordStore = newStore();
        RecordStore.updateCategory(123, 999);
        expect(RecordStore.get(123).category_id).toBe(999);
    });

    it('stores pending posts', function() {
        var RecordStore = newStore();
        var origRecord = JSON.parse(JSON.stringify(RecordStore.get(123)));
        expect(RecordStore.hasPendingPosts()).toBeFalsy();

        var context = RecordStore.addPendingPost(123, {
            status: 'changed',
            status_type: 'finished',
            comment: 'comment'
        });
        var pendingRecord = RecordStore.get(123);
        expect(pendingRecord.status).toBe('changed');
        expect(pendingRecord.status_type).toBe('finished');
        expect(pendingRecord.updated_at).toBeGreaterThan(origRecord.updated_at);
        expect(pendingRecord.has_newer_episode).toBeFalsy();
        expect(pendingRecord.pendingPosts.length).toBe(1);
        var pendingPost = pendingRecord.pendingPosts[0];
        expect(pendingPost.post.status).toBe('changed');
        expect(pendingPost.post.status_type).toBe('finished');
        expect(pendingPost.post.comment).toBe('comment');
        expect(RecordStore.hasPendingPosts()).toBeTruthy();

        RecordStore.resolvePendingPost(context, {
            id: 123,
            user_id: 456,
            work_id: 789,
            category_id: 123,
            status_type: 'finished',
            status: 'changed',
            title: 'blah blah',
            updated_at: Date.now(),
        }, {
            id: 456,
            user_id: 456,
            work_id: 789,
            status_type: 'finished',
            status: 'changed',
            created_at: Date.now()
        });
        expect(RecordStore.hasPendingPosts()).toBeFalsy();
        expect(RecordStore.get(123).pendingPosts).toBeUndefined();
    });

    it('stores new record', function() {
        var RecordStore = newStore();
        RecordStore.add({
            id: 456,
            user_id: 456,
            work_id: 789,
            category_id: 123,
            status_type: 'watching',
            status: 'test',
            title: 'blah blah',
            updated_at: Date.now()
        });
        expect(RecordStore.getAll()[1].id).toBe(456);
        expect(RecordStore.get(456).id).toBe(456);
    });
});
