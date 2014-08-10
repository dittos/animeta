module.exports.keyComparator = function(keyFunc) {
    return (a, b) => {
        a = keyFunc(a);
        b = keyFunc(b);
        if (a < b)
            return -1;
        if (a > b)
            return 1;
        return 0;
    };
};

module.exports.zerofill = zerofill = function(n) {
    n = String(n);
    if (n.length == 1)
        n = '0' + n;
    return n;
};

module.exports.getTime = function(date) {
    return zerofill(date.getHours()) + ':' + zerofill(date.getMinutes());
};

var HOURS = [];
for (var h = 0; h < 24; h++) {
    var result;
    if (h < 12)
        result = '오전 ' + h + '시';
    else if (h == 12)
        result = '정오';
    else
        result = '오후 ' + (h - 12) + '시';
    HOURS[h] = result;
}

module.exports.formatTime = function(value) {
    var result = HOURS[value.getHours()];
    var m = value.getMinutes();
    if (m > 0) {
        result += ' ' + zerofill(m) + '분';
    }
    return result;
};

module.exports.debounce = function(fn, t) {
    var timer;
    return function() {
        var self = this;
        if (timer) clearTimeout(timer);
        timer = setTimeout(function() {
            fn.call(self);
            timer = null;
        }, t);
    };
};

module.exports.deepCopy = function(obj) {
    return $.extend(/*deep:*/ true, {}, obj);
};
