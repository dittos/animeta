import {find, isEqual, remove} from 'lodash';

const UNDEFINED = '';

export default class {
    constructor() {
        this._cache = {};
    }

    getIfPresent(path, params) {
        const entries = this._cache[path];
        if (entries) {
            if (typeof params === 'undefined') {
                params = UNDEFINED;
            }
            const entry = find(entries, entry => isEqual(entry.params, params));
            if (entry) {
                return entry.value;
            }
        }
    }

    put(path, params, value) {
        if (typeof params === 'undefined') {
            params = UNDEFINED;
        }
        if (!this._cache[path]) {
            this._cache[path] = [];
        }
        this._cache[path].push({ params, value });
    }

    remove(path, params) {
        const entries = this._cache[path];
        if (entries) {
            if (typeof params === 'undefined') {
                params = UNDEFINED;
            }
            remove(entries, entry => isEqual(entry.params, params));
            if (entries.length === 0) {
                delete this._cache[path];
            }
        }
    }
}
