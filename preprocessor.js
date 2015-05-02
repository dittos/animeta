var babel = require('babel');

module.exports = {
    process: function(src, filename) {
        if (filename.indexOf('node_modules') === -1)
            return babel.transform(src, {optional: ['es7.objectRestSpread']}).code;
        return src;
    }
};
