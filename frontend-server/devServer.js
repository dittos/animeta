const fs = require('fs');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
import { createServer } from './frontend';
import { CompilingAppProvider } from './lib/dev/CompilingAppProvider';

// Don't require directly to fool tsc
const webpackConfigFactory = module.require('../frontend/webpack.config.js');
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
    })
  );
  server.use(webpackHotMiddleware(compiler));
  server.use('/static', express.static(__dirname + '/../animeta/static'));
  createServer({
    server,
    appProvider,
    // assets.json is written by frontend compiler
    getAssets: () => JSON.parse(fs.readFileSync(__dirname + '/../frontend/assets.json').toString('utf8')),
  }).listen(3000);
});
