var _ = require('lodash');

const scheduleComparator = (item) =>
    nullslast(item.metadata.schedule.jp && item.metadata.schedule.jp.date);

const preferKRScheduleComparator = (item) =>
    nullslast(item.metadata.schedule.kr && item.metadata.schedule.kr.date ||
        item.metadata.schedule.jp && item.metadata.schedule.jp.date);

const recordCountComparator = (item) => -item.record_count;

const comparatorMap = {
    'schedule': scheduleComparator,
    'schedule.kr': preferKRScheduleComparator,
    'recordCount': recordCountComparator
};

function nullslast(val) {
    return [!val, val];
}

function reducer(state, action) {
    if (!state) {
        state = {
            items: [],
            ordering: 'schedule',
            containsKRSchedule: false
        };
    }

    switch (action.type) {
    case 'initialize':
        return {
            items: _.sortBy(action.items, comparatorMap[action.ordering]),
            ordering: action.ordering,
            containsKRSchedule: _.some(action.items, i => i.metadata.schedule.kr && i.metadata.schedule.kr.date),
        };
    case 'sort':
        return {
            ...state,
            items: _.sortBy(state.items, comparatorMap[action.ordering]),
            ordering: action.ordering,
        };
    case 'favoriteAdded':
        var item = action.item;
        item.record = {
            id: action.recordId
        };
        item.record_count++;
        return {
            ...state,
            items: state.items.slice()
        };
    }
    return state;
}

module.exports = Object.assign(reducer, {
    getAllItems(state) {
        return state.schedule.items;
    },

    getOrdering(state) {
        return state.schedule.ordering;
    },

    containsKRSchedule(state) {
        return state.schedule.containsKRSchedule;
    }
});
