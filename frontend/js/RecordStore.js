var events = require('events');
var _ = require('lodash');
var Dispatcher = require('./Dispatcher');

var _events = new events.EventEmitter;
var _records = {};

exports.addChangeListener = function(listener) {
    _events.on('change', listener);
};

exports.removeChangeListener = function(listener) {
    _events.removeListener('change', listener);
};

function emitChange() {
    _events.emit('change');
}

exports.getCount = function() {
    return _.size(_records);
};

exports.getCategoryStats = function() {
    return _.countBy(_records, record => record.category_id || 0);
};

exports.getStatusTypeStats = function() {
    return _.countBy(_records, 'status_type');
};

exports.query = function(statusType, categoryId, sortBy) {
    var chain = _(_records);
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
};

exports.get = function(id) {
    return _records[id];
};

var actions = {
    loadRecords({records}) {
        records.forEach(record => {
            _records[record.id] = record;
        });
        emitChange();
    },
    updateRecordTitle({recordID, title}) {
        _records[recordID].title = title;
        emitChange();
    },
    updateRecordCategory({recordID, categoryID}) {
        _records[recordID].category_id = categoryID;
        emitChange();
    },
    createPendingPost({recordID, post}) {
        var record = _records[recordID];
        record.status = post.status;
        record.status_type = post.status_type;
        record.updated_at = +(new Date);
        record.has_newer_episode = false;
        emitChange();
    },
    resolvePendingPost({updatedRecord}) {
        _records[updatedRecord.id] = updatedRecord;
        emitChange();
    },
    addRecord({record}) {
        _records[record.id] = record;
        emitChange();
    },
    deleteRecord({recordID}) {
        delete _records[recordID];
        emitChange();
    },
    removeCategory({categoryID}) {
        _.each(_records, record => {
            if (record.category_id == categoryID)
                record.category_id = 0;
        });
        emitChange();
    },
    deletePost({updatedRecord}) {
        _records[updatedRecord.id] = updatedRecord;
        emitChange();
    }
};

exports.dispatchToken = Dispatcher.register(payload => {
    var action = actions[payload.type];
    if (action)
        action(payload);
});
