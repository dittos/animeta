var $ = require('jquery');

function loadRecords(records) {
    return {
        type: 'loadRecords',
        records
    };
}

function addRecord(userName, record) {
    return dispatch => $.post('/api/v2/users/' + userName + '/records', record).then(result => {
        dispatch({
            type: 'addRecord',
            record: result.record
        });
    });
}

function getRecordEndpoint(recordID) {
    return '/newapi/v2/records/' + recordID;
}

function updateRecord(recordID, updates) {
    return $.post(getRecordEndpoint(recordID), updates);
}

function updateCategory(recordID, categoryID) {
    return dispatch => updateRecord(recordID, {category_id: categoryID}).then(() => {
        dispatch({
            type: 'updateRecordCategory',
            recordID, categoryID
        });
    });
}

function updateTitle(recordID, title) {
    return dispatch => updateRecord(recordID, {title: title}).then(() => {
        dispatch({
            type: 'updateRecordTitle',
            recordID, title
        });
    });
}

function deleteRecord(recordID) {
    return dispatch => $.ajax({
        url: getRecordEndpoint(recordID),
        type: 'DELETE'
    }).then(() => {
        dispatch({
            type: 'deleteRecord',
            recordID
        });
    });
}

module.exports = {
    loadRecords,
    addRecord,
    updateCategory,
    updateTitle,
    deleteRecord
};
