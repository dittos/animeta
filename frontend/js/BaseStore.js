class BaseStore {
    constructor() {
        this._listeners = [];
    }

    addChangeListener(callback) {
        this._listeners.push(callback);
    }

    removeChangeListener(callback) {
        this._listeners = this._listeners.filter(cb => cb != callback);
    }

    emitChange(data) {
        this._listeners.forEach(callback => callback(data));
    }
}

module.exports = BaseStore;
