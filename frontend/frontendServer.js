if (!global._babelPolyfill) {
    require('babel-polyfill');
}
var less = require('less');
require('css-modules-require-hook')({
    extensions: ['.less'],
    generateScopedName: '[name]_[local]_[hash:base64:5]', // same with css-loader
    mode: 'global',
    rootDir: __dirname,
    preprocessCss: function(css, filename) {
        var _result;
        less.render(css, {syncImport: true, filename: filename}, function(err, result) {
            if (err) {
                throw err;
            }
            _result = result.css;
        });
        return _result;
    }
});
require('moment').locale('ko');
var server = require('./server/frontend');

server.start(err => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Server running at:', server.info.uri);
});
