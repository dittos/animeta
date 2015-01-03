var Dispatcher = require('./Dispatcher');

function loadRecords(records) {
    Dispatcher.dispatch({
        type: 'loadRecords',
        records
    });
}

function addRecord(userName, record) {
    return $.post('/api/v2/users/' + userName + '/records', record).then(result => {
        Dispatcher.dispatch({
            type: 'addRecord',
            record: result.record
        });
    });
}

function updateRecord(recordID, updates) {
    return $.post('/api/v2/records/' + recordID, updates);
}

function updateCategory(recordID, categoryID) {
    return updateRecord(recordID, {category_id: categoryID}).then(() => {
        Dispatcher.dispatch({
            type: 'updateRecordCategory',
            recordID, categoryID
        });
    });
}

function updateTitle(recordID, title) {
    return updateRecord(recordID, {title: title}).then(() => {
        Dispatcher.dispatch({
            type: 'updateRecordTitle',
            recordID, title
        });
    });
}

module.exports = {
    loadRecords,
    addRecord,
    updateCategory,
    updateTitle
};
