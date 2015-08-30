module.exports = {
    setItem(key, value) {
        window.localStorage.setItem(key, value);
    },
    getItem(key) {
        return window.localStorage.getItem(key);
    }
};
