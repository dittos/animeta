const path = require('path');
const express = require('express');
const {createServer} = require('@animeta/web-frontend-server');
const {ViteAppProvider} = require('./ViteAppProvider');

const appProvider = new ViteAppProvider();
appProvider.start().then(() => {
  const server = express();
  server.use(appProvider.vite.middlewares);
  createServer({
    config: require(process.env.ANIMETA_CONFIG_PATH || './config.json'),
    server,
    appProvider,
    getAssets: (url) => appProvider.getAssets(url),
    staticDir: path.join(__dirname, 'static'),
  }).listen(3000);
});
