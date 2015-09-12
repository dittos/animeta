/* global PreloadData */
var LocalStorage = require('../LocalStorage');

function getPrefKey(key) {
    return `animeta.table.${PreloadData.period}.${key}`;
}

export function getOrdering() {
    return LocalStorage.getItem(getPrefKey('ordering')) || 'schedule';
}

export function setOrdering(ordering) {
    LocalStorage.setItem(getPrefKey('ordering'), ordering);
}
