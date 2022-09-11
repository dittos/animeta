var fs = require('fs')

var config = JSON.parse(fs.readFileSync(process.env.ANIMETA_CONFIG_PATH || './config.json'));
if (config.sentryDsnNew) {
  Sentry.init({ dsn: config.sentryDsnNew });
}

var { createServer } = require('./frontend');
var port = process.env.PORT || 3000;

var {DefaultAppProvider} = require('./AppProvider');
var appProvider = new DefaultAppProvider(process.env.ANIMETA_BUNDLE_PATH);
var assets = JSON.parse(fs.readFileSync(process.env.ANIMETA_ASSETS_PATH));

var server = createServer({
  config,
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
