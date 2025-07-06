const path = require('path');
const express = require('express');
const {createServer} = require('@animeta/web-frontend-server');
const {ViteAppProvider} = require('./ViteAppProvider');

const appProvider = new ViteAppProvider();
appProvider.start().then(() => {
  const server = express();
  server.use(appProvider.vite.middlewares);
  server.get('/mockServiceWorker.js', (req, res) => res.sendFile(path.resolve(__dirname, './static/mockServiceWorker.js')))
  createServer({
    config: require(process.env.ANIMETA_CONFIG_PATH || './config.json'),
    server,
    appProvider,
    getAssets: (url) => appProvider.getAssets(url),
    staticDir: path.join(__dirname, 'static'),
  }).listen(3000);
});
