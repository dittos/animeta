import forEach from 'lodash/forEach';
import size from 'lodash/size';
import countBy from 'lodash/countBy';
import filter from 'lodash/filter';
import sort from 'lodash/sortBy';

var reducers = {
    loadRecords(_records, {records}) {
        records.forEach(record => {
            _records[record.id] = record;
        });
    },
    updateRecordTitle(_records, {recordID, title}) {
        _records[recordID].title = title;
    },
    updateRecordCategory(_records, {recordID, categoryID}) {
        _records[recordID].category_id = categoryID;
    },
    createPendingPost(_records, {recordID, post}) {
        var record = _records[recordID];
        record.status = post.status;
        record.status_type = post.status_type;
        record.updated_at = +(new Date);
        record.has_newer_episode = false;
    },
    resolvePendingPost(_records, {updatedRecord}) {
        _records[updatedRecord.id] = updatedRecord;
    },
    addRecord(_records, {record}) {
        _records[record.id] = record;
    },
    deleteRecord(_records, {recordID}) {
        delete _records[recordID];
    },
    removeCategory(_records, {categoryID}) {
        forEach(_records, record => {
            if (record.category_id == categoryID)
                record.category_id = 0;
        });
    },
    deletePost(_records, {updatedRecord}) {
        _records[updatedRecord.id] = updatedRecord;
    }
};

function recordReducer(state = {}, action) {
    const reducer = reducers[action.type];
    if (reducer)
        reducer(state, action);
    return state;
}

module.exports = Object.assign(recordReducer, {
    getCount(state) {
        return size(state.record);
    },

    getCategoryStats(state) {
        return countBy(state.record, record => record.category_id || 0);
    },

    getStatusTypeStats(state) {
        return countBy(state.record, 'status_type');
    },

    query(state, statusType, categoryId, sortBy) {
        var records = state.record;
        if (statusType) {
            records = filter(records, record => record.status_type == statusType);
        }
        if (categoryId === 0 || categoryId) {
            records = filter(records, record => (record.category_id || 0) == categoryId);
        }
        if (sortBy == 'date') {
            records = sort(records, 'created_at').reverse();
        } else if (sortBy == 'title') {
            records = sort(records, 'title');
        }
        return records;
    },

    get(state, id) {
        return state.record[id];
    },
});
