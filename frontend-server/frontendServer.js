if (!global._babelPolyfill) {
  require('babel-polyfill');
}
var { createServer } = require('./frontend');
var port = process.env.PORT || 3000;

var {DefaultAppProvider} = require('./lib/core/AppProvider');
var appProvider = new DefaultAppProvider('./bundle.js');
var assets = require('./assets.json');

var server = createServer({
  appProvider,
  getAssets: () => assets,
}).listen(port, () => {
  console.log('Server running at port', port);
});

function handleSignal(signal) {
  console.info(`Got ${signal}.`, new Date().toISOString());
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      process.exit();
    }
  });
}

process.on('SIGINT', handleSignal);
process.on('SIGTERM', handleSignal);
