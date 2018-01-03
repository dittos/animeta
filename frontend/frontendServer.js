if (!global._babelPolyfill) {
    require('babel-polyfill');
}
process.env = Object.assign({}, process.env);
var { createServer } = require('./server/frontend');
var port = process.env.PORT || 3000;

var appModule = require('./bundle');
var app = appModule.default || appModule;
var assets = require('./assets.json');

createServer({
    app,
    getAssets: () => assets,
}).listen(port, () => {
    console.log('Server running at port', port);
});
