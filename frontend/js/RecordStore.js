var _ = require('lodash');
var {ReduceStore} = require('flux/utils');
var Dispatcher = require('./Dispatcher');

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

class RecordStore extends ReduceStore {
    getInitialState() {
        return {};
    }

    getCount() {
        return _.size(this.getState());
    }

    getCategoryStats() {
        return _.countBy(this.getState(), record => record.category_id || 0);
    }

    getStatusTypeStats() {
        return _.countBy(this.getState(), 'status_type');
    }

    query(statusType, categoryId, sortBy) {
        var chain = _(this.getState());
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
    }

    get(id) {
        return this.getState()[id];
    }

    reduce(state, action) {
        const reducer = reducers[action.type];
        if (reducer)
            reducer(state, action);
        return state;
    }

    areEqual() {
        // Currently mutated in-place
        return false;
    }
}

module.exports = new RecordStore(Dispatcher);
