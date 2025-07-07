import fs from 'fs';
import path from 'path';
import * as Sentry from '@sentry/node';
import { createServer } from './frontend';
import { DefaultAppProvider } from './AppProvider';
import { ViteSSRAppProvider } from './ViteSSRAppProvider';

const config = JSON.parse(fs.readFileSync(process.env.ANIMETA_CONFIG_PATH || './config.json', {encoding: 'utf8'}));
if (config.sentryDsnNew) {
  Sentry.init({ dsn: config.sentryDsnNew });
}

const port = process.env.PORT || 3000;

async function main() {
  const appProvider = process.env.ANIMETA_FRONTEND_APP_PROVIDER === 'vite'
    ? new ViteSSRAppProvider(process.env.ANIMETA_FRONTEND_DIST_PATH, config.staticUrl || '/static')
    : new DefaultAppProvider(process.env.ANIMETA_FRONTEND_DIST_PATH);
  await appProvider.start();

  const server = createServer({
    config,
    appProvider,
    staticDir: path.join(process.env.ANIMETA_FRONTEND_DIST_PATH, 'static'),
  }).listen(Number(port), '0.0.0.0', () => {
    console.log('Server running at port', port);
  });

  function handleSignal(signal: string) {
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
}

main().catch(console.error)
