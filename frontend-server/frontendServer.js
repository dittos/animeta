if (!global._babelPolyfill) {
  require('babel-polyfill');
}
var { createServer } = require('./frontend');
var port = process.env.PORT || 3000;

// Don't require directly to fool tsc
var appModule = module.require('./bundle');
var app = appModule.default || appModule;
var assets = require('./assets.json');

var server = createServer({
  app,
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
