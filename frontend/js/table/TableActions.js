var $ = require('jquery');
var Dispatcher = require('../store/Dispatcher');
var TablePrefs = require('./TablePrefs');

export function initialize(initialData) {
    Dispatcher.dispatch({
        type: 'initialize',
        items: initialData,
        ordering: TablePrefs.getOrdering(),
    });
}

export function sort(ordering) {
    Dispatcher.dispatch({
        type: 'sort',
        ordering
    });
}

export function favoriteItem(item) {
    return $.post('/api/v1/records', {
        work: item.title,
        status_type: 'interested'
    }).then((result) => {
        item.record = {
            id: result.record_id
        };
        item.record_count++;
        Dispatcher.dispatch({
            type: 'favoriteAdded',
            title: item.title
        });
        return {
            ...result,
            title: item.title
        }
    });
}
