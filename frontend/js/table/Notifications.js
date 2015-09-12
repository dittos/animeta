class Notifications {
    constructor() {
        this.hidden = true;
        this.message = '';
        this.timer = null;
        this.onChange = () => {};
    }

    setListener(listener) {
        this.onChange = listener;
    }

    clearListener() {
        this.onChange = () => {};
    }

    getState() {
        return {
            hidden: this.hidden,
            message: this.message
        };
    }

    show(message, timeout) {
        this._clearTimer();
        this.hidden = false;
        this.message = message;
        if (timeout) {
            this.timer = setTimeout(this.hide.bind(this), timeout);
        }
        this.onChange();
    }

    hide() {
        this._clearTimer();
        this.hidden = true;
        this.onChange();
    }

    _clearTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}

module.exports = new Notifications();
