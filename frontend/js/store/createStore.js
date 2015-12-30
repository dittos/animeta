import * as Redux from 'redux';
import ScheduleStore from '../store/ScheduleStore';
import AppReducer from '../store/AppReducer';
import FetchReducer from '../store/FetchReducer';

var reducers = Redux.combineReducers({
    schedule: ScheduleStore,
    app: AppReducer,
    fetches: FetchReducer,
});

function createClientMiddleware(client) {
    return store => next => action => {
        if (typeof action === 'function') {
            return action(store.dispatch, client, store.getState);
        }
        return next(action);
    };
}

export default function createStore(client, initialState) {
    return Redux.applyMiddleware(
        createClientMiddleware(client)
    )(Redux.createStore)(reducers, initialState);
}
