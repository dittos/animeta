var _ = require('lodash');
var {ReduceStore} = require('flux/utils');
var Dispatcher = require('../store/Dispatcher');
var TablePrefs = require('./TablePrefs');

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

class ScheduleStore extends ReduceStore {
    getInitialState() {
        return {
            items: [],
            ordering: 'schedule',
            containsKRSchedule: false
        };
    }

    getAllItems() {
        return this.getState().items;
    }

    getOrdering() {
        return this.getState().ordering;
    }

    containsKRSchedule() {
        return this.getState().containsKRSchedule;
    }

    reduce(state, action) {
        switch (action.type) {
        case 'initialize':
            return {
                items: _.sortBy(action.items, comparatorMap[action.ordering]),
                ordering: action.ordering,
                containsKRSchedule: _.some(action.items, i => i.metadata.schedule.kr && i.metadata.schedule.kr.date),
            };
        case 'sort':
            TablePrefs.setOrdering(action.ordering);
            return {
                ...state,
                items: _.sortBy(state.items, comparatorMap[action.ordering]),
                ordering: action.ordering,
            };
        }
        return state;
    }

    areEqual() {
        // Currently mutated in-place
        return false;
    }
}

module.exports = new ScheduleStore(Dispatcher);
