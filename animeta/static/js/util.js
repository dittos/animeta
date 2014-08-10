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

module.exports.zerofill = function(n) {
    n = String(n);
    if (n.length == 1)
        n = '0' + n;
    return n;
};
