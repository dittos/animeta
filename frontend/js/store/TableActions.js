var $ = require('jquery');

export function load(period) {
    return (dispatch, client) => client.call(`/table/periods/${period}`, {
        only_first_period: JSON.stringify(true)
    }).then(data => {
        dispatch({
            type: 'initialize',
            items: data,
            ordering: 'schedule'
        });
    });
}

export function sort(ordering) {
    return {
        type: 'sort',
        ordering
    };
}

export function favoriteItem(item) {
    // TODO: use v2 api
    return dispatch => $.post('/api/v1/records', {
        work: item.title,
        status_type: 'interested'
    }).then((result) => {
        dispatch({
            type: 'favoriteAdded',
            item,
            recordId: result.record_id
        });
        return {
            ...result,
            title: item.title
        }
    });
}
