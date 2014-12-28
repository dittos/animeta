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
        },
        {
            id: 333,
            user_id: 456,
            work_id: 1000,
            status_type: 'suspended',
            status: 'test2',
            title: 'aaaaaaaa',
            updated_at: Date.now() + 1000,
            has_newer_episode: true
        }
    ]);
    return RecordStore;
}

describe('RecordStore', function() {
    it('stores count', function() {
        expect(newStore().getCount()).toBe(2);
    });

    it('find all records', function() {
        var RecordStore = newStore();
        var records = RecordStore.query();
        expect(records.length).toBe(2);
        var ids = records.map(r => r.id).sort();
        expect(ids[0]).toBe(123);
        expect(ids[1]).toBe(333);
    });

    it('find records by status type', function() {
        var RecordStore = newStore();
        var watchings = RecordStore.query('watching', null, null);
        expect(watchings.length).toBe(1);
        expect(watchings[0].id).toBe(123);
        expect(RecordStore.query('finished', null, null).length).toBe(0);
    });

    it('find uncategorized records', function() {
        var RecordStore = newStore();
        var uncategorizeds = RecordStore.query(null, 0, null);
        expect(uncategorizeds.length).toBe(1);
        expect(uncategorizeds[0].id).toBe(333);
    });

    it('find records by category', function() {
        var RecordStore = newStore();
        var records = RecordStore.query(null, 123, null);
        expect(records.length).toBe(1);
        expect(records[0].id).toBe(123);
        expect(RecordStore.query(null, 456, null).length).toBe(0);
    });

    it('find records sorted', function() {
        var RecordStore = newStore();
        var dateSorted = RecordStore.query(null, null, 'date');
        expect(dateSorted[0].id).toBe(333);
        expect(dateSorted[1].id).toBe(123);
        var titleSorted = RecordStore.query(null, null, 'title');
        expect(dateSorted[0].id).toBe(333);
        expect(dateSorted[1].id).toBe(123);
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

    it('updates record when pending post is created', function() {
        var RecordStore = newStore();

        var context = 12345;
        RecordStore.createPendingPost(123, {
            status: 'changed',
            status_type: 'finished',
            comment: 'comment'
        }, context);
        var pendingRecord = RecordStore.get(123);
        expect(pendingRecord.status).toBe('changed');
        expect(pendingRecord.status_type).toBe('finished');
        expect(pendingRecord.has_newer_episode).toBeFalsy();

        var newUpdatedAt = Date.now() + 1000;
        RecordStore.resolvePendingPost(context, {
            id: 123,
            user_id: 456,
            work_id: 789,
            category_id: 123,
            status_type: 'finished',
            status: 'changed',
            title: 'blah blah',
            updated_at: newUpdatedAt,
        }, {
            id: 456,
            user_id: 456,
            work_id: 789,
            status_type: 'finished',
            status: 'changed',
            created_at: newUpdatedAt
        });
        expect(RecordStore.get(123).updated_at).toBe(newUpdatedAt);
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
        expect(RecordStore.query()[2].id).toBe(456);
        expect(RecordStore.get(456).id).toBe(456);
    });

    it('collect stats by category', function() {
        var RecordStore = newStore();
        var stats = RecordStore.getCategoryStats();
        expect(stats[0]).toBe(1);
        expect(stats[123]).toBe(1);
    });

    it('collect stats by status type', function() {
        var RecordStore = newStore();
        var stats = RecordStore.getStatusTypeStats();
        expect(stats.watching).toBe(1);
        expect(stats.suspended).toBe(1);
    });
});
