var RecordStore = require('./RecordStore');

function updateRecord(recordID, updates) {
    return $.post('/api/v2/records/' + recordID, updates);
}

function updateCategory(recordID, categoryID) {
    return updateRecord(recordID, {category_id: categoryID}).then(() => {
        RecordStore.updateCategory(recordID, categoryID);
    });
}

function updateTitle(recordID, title) {
    return updateRecord(recordID, {title: title}).then(() => {
        RecordStore.updateTitle(recordID, title);
    });
}

module.exports = {
    updateCategory,
    updateTitle
};
