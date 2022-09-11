const fs = require('fs');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const {createServer} = require('@animeta/web-frontend-server');
const {CompilingAppProvider} = require('./CompilingAppProvider');

// Don't require directly to fool tsc
const webpackConfigFactory = module.require('./webpack.config.js');
const webpackConfig = webpackConfigFactory({ server: false, prod: false });
const compiler = webpack(webpackConfig);

const serverWebpackConfig = webpackConfigFactory({
  server: true,
  prod: false,
  outputPath: '/',
});
const appProvider = new CompilingAppProvider(serverWebpackConfig);
appProvider.start().then(() => {
  const server = express();
  server.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      static: ['static'],
    })
  );
  server.use(webpackHotMiddleware(compiler));
  // server.use('/static', express.static(__dirname + '/static'));
  createServer({
    config: require(process.env.ANIMETA_CONFIG_PATH || '../config.json'),
    server,
    appProvider,
    // assets.json is written by webpack
    getAssets: () => JSON.parse(fs.readFileSync(__dirname + '/dist/assets.json').toString('utf8')),
  }).listen(3000);
});
