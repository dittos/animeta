jest.dontMock('../Dispatcher');
jest.dontMock('../RecordStore');
jest.dontMock('flux/lib/FluxStore');

describe('RecordStore', function() {
    var RecordStore;
    var callback;

    function initStore() {
        callback({
            type: 'loadRecords',
            records: [
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
            ]
        });
    }

    beforeEach(function() {
        var Dispatcher = require('../Dispatcher');
        RecordStore = require('../RecordStore');
        callback = Dispatcher.dispatch.bind(Dispatcher);
        initStore();
    });

    it('stores count', function() {
        expect(RecordStore.getCount()).toBe(2);
    });

    it('find all records', function() {
        var records = RecordStore.query();
        expect(records.length).toBe(2);
        var ids = records.map(r => r.id).sort();
        expect(ids[0]).toBe(123);
        expect(ids[1]).toBe(333);
    });

    it('find records by status type', function() {
        var watchings = RecordStore.query('watching', null, null);
        expect(watchings.length).toBe(1);
        expect(watchings[0].id).toBe(123);
        expect(RecordStore.query('finished', null, null).length).toBe(0);
    });

    it('find uncategorized records', function() {
        var uncategorizeds = RecordStore.query(null, 0, null);
        expect(uncategorizeds.length).toBe(1);
        expect(uncategorizeds[0].id).toBe(333);
    });

    it('find records by category', function() {
        var records = RecordStore.query(null, 123, null);
        expect(records.length).toBe(1);
        expect(records[0].id).toBe(123);
        expect(RecordStore.query(null, 456, null).length).toBe(0);
    });

    it('find records sorted', function() {
        var dateSorted = RecordStore.query(null, null, 'date');
        expect(dateSorted[0].id).toBe(333);
        expect(dateSorted[1].id).toBe(123);
        var titleSorted = RecordStore.query(null, null, 'title');
        expect(dateSorted[0].id).toBe(333);
        expect(dateSorted[1].id).toBe(123);
    });

    it('find one record by id', function() {
        var record = RecordStore.get(123);
        expect(record.id).toBe(123);
        expect(record.title).toBe('blah blah');
    });

    it('updates title', function() {
        callback({
            type: 'updateRecordTitle',
            recordID: 123,
            title: 'changed'
        });
        expect(RecordStore.get(123).title).toBe('changed');
    });

    it('updates category', function() {
        callback({
            type: 'updateRecordCategory',
            recordID: 123,
            categoryID: 999
        });
        expect(RecordStore.get(123).category_id).toBe(999);
    });

    it('updates record when pending post is created', function() {
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
        var pendingRecord = RecordStore.get(123);
        expect(pendingRecord.status).toBe('changed');
        expect(pendingRecord.status_type).toBe('finished');
        expect(pendingRecord.has_newer_episode).toBeFalsy();

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
                id: 456,
                user_id: 456,
                work_id: 789,
                status_type: 'finished',
                status: 'changed',
                created_at: newUpdatedAt
            }
        });
        expect(RecordStore.get(123).updated_at).toBe(newUpdatedAt);
    });

    it('stores new record', function() {
        callback({
            type: 'addRecord',
            record: {
                id: 456,
                user_id: 456,
                work_id: 789,
                category_id: 123,
                status_type: 'watching',
                status: 'test',
                title: 'blah blah',
                updated_at: Date.now()
            }
        });
        expect(RecordStore.query()[2].id).toBe(456);
        expect(RecordStore.get(456).id).toBe(456);
    });

    it('collect stats by category', function() {
        var stats = RecordStore.getCategoryStats();
        expect(stats[0]).toBe(1);
        expect(stats[123]).toBe(1);
    });

    it('collect stats by status type', function() {
        var stats = RecordStore.getStatusTypeStats();
        expect(stats.watching).toBe(1);
        expect(stats.suspended).toBe(1);
    });

    it('unsets category id on category remove', function() {
        callback({type: 'removeCategory', categoryID: 123});
        expect(RecordStore.get(123).category_id).toBeFalsy();
    });

    it('deletes record', function() {
        callback({type: 'deleteRecord', recordID: 123});
        expect(RecordStore.get(123)).toBeUndefined();
    });

    it('updates record on post delete', function() {
        callback({
            type: 'deletePost',
            updatedRecord: {
                id: 123,
                status: 'prev'
            }
        });
        expect(RecordStore.get(123).status).toBe('prev');
    });
});
