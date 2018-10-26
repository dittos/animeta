const fs = require('fs');
const express = require('express');
const webpack = require('webpack');
const MemoryFileSystem = require('memory-fs');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const requireFromString = require('require-from-string');
import { createServer } from './frontend';

// Don't require directly to fool tsc
const webpackConfigFactory = module.require('../frontend/webpack.config.js');
const serverWebpackConfig = webpackConfigFactory({
  server: true,
  prod: false,
  outputPath: '/',
});
const webpackConfig = webpackConfigFactory({ server: false, prod: false });
const compiler = webpack(webpackConfig);
let serverCompiler = webpack(serverWebpackConfig);
let serverVfs = new MemoryFileSystem();
serverCompiler.outputFileSystem = serverVfs;
serverCompiler.run(() => {
  const code = serverVfs.readFileSync('/bundle.js').toString('utf8');
  serverCompiler = null;
  serverVfs = null;
  const appModule = requireFromString(code);
  const app = appModule.default || appModule;
  const server = express();
  server.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      serverSideRender: true,
    })
  );
  server.use(webpackHotMiddleware(compiler));
  server.use('/static', express.static(__dirname + '/../animeta/static'));
  createServer({
    server,
    app,
    getAssets: () => JSON.parse(fs.readFileSync(__dirname + '/../frontend/assets.json').toString('utf8')),
  }).listen(3000);
});
