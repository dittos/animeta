var _ = require('lodash');

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
        _.each(_records, record => {
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
        return _.size(state.record);
    },

    getCategoryStats(state) {
        return _.countBy(state.record, record => record.category_id || 0);
    },

    getStatusTypeStats(state) {
        return _.countBy(state.record, 'status_type');
    },

    query(state, statusType, categoryId, sortBy) {
        var chain = _(state.record);
        if (statusType) {
            chain = chain.filter(record => record.status_type == statusType);
        }
        if (categoryId === 0 || categoryId) {
            chain = chain.filter(record => (record.category_id || 0) == categoryId);
        }
        chain = chain.values();
        if (sortBy == 'date') {
            chain = chain.sortBy('created_at').reverse();
        } else if (sortBy == 'title') {
            chain = chain.sortBy('title');
        }
        return chain.value();
    },

    get(state, id) {
        return state.record[id];
    },
});
