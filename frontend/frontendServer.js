if (!global._babelPolyfill) {
    require('babel-polyfill');
}
process.env = Object.assign({}, process.env);
var app = require('./server/frontend');
var port = process.env.PORT || 3000;

app.locals.DEBUG = false;
app.locals.assets = require('../assets.json');
app.locals.nuriApp = require('./bundle');

app.listen(port, () => {
    console.log('Server running at port', port);
});
