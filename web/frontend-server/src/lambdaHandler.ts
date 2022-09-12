import fs from 'fs';
import path from 'path';
import * as Sentry from '@sentry/serverless';
import type { Handler } from 'aws-lambda';
import { createServer } from './frontend';
import { DefaultAppProvider } from './AppProvider';
import serverlessExpress from '@vendia/serverless-express';
import * as dotenv from 'dotenv';

dotenv.config();

const config = JSON.parse(fs.readFileSync(process.env.ANIMETA_CONFIG_PATH || './config.json', {encoding: 'utf8'}));
if (config.sentryDsnNew) {
  Sentry.AWSLambda.init({ dsn: config.sentryDsnNew });
}

const appProvider = new DefaultAppProvider(path.join(process.env.ANIMETA_FRONTEND_DIST_PATH, 'bundle.server.js'));
const assets = JSON.parse(fs.readFileSync(path.join(process.env.ANIMETA_FRONTEND_DIST_PATH, 'assets.json'), {encoding: 'utf8'}));

const app = createServer({
  config,
  appProvider,
  getAssets: () => assets,
  staticDir: path.join(process.env.ANIMETA_FRONTEND_DIST_PATH, 'static'),
})

export const handler: Handler = Sentry.AWSLambda.wrapHandler(serverlessExpress({ app }))
