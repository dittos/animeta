const fs = require('fs');
const express = require('express');
const webpack = require('webpack');
const MemoryFileSystem = require('memory-fs');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const vm = require('vm');
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
let setApp = null;
serverCompiler.outputFileSystem = serverVfs;
serverCompiler.watch({}, () => {
  // TODO: sync reload timing with webpackHotMiddleware
  const code = serverVfs.readFileSync('/bundle.js').toString('utf8');
  const sandbox = {
    require,
    module: { exports: {} }
  };
  const context = vm.createContext(sandbox);
  const script = new vm.Script(code);
  script.runInContext(context);
  const appModule = sandbox.module.exports;
  const app = appModule.default || appModule;
  if (!setApp) {
    const server = express();
    server.use(
      webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        serverSideRender: true,
      })
    );
    server.use(webpackHotMiddleware(compiler));
    server.use('/static', express.static(__dirname + '/../animeta/static'));
    const s = createServer({
      server,
      app,
      getAssets: () => JSON.parse(fs.readFileSync(__dirname + '/../frontend/assets.json').toString('utf8')),
    });
    s.server.listen(3000);
    setApp = s.setApp;
  } else {
    setApp(app);
  }
});
