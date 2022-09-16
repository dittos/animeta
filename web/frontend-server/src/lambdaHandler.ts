import fs from 'fs';
import path from 'path';
import * as Sentry from '@sentry/serverless';
import type { Handler } from 'aws-lambda';
import { createServer } from './frontend';
import { DefaultAppProvider } from './AppProvider';
import serverlessExpress from '@vendia/serverless-express';
import * as dotenv from 'dotenv';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

async function initialize() {
  dotenv.config();

  const ssmClient = new SSMClient({});
  const ssmResult = await ssmClient.send(new GetParameterCommand({
    Name: process.env.ANIMETA_CONFIG_SSM_PARAMETER_NAME,
    WithDecryption: true,
  }))
  const config = JSON.parse(ssmResult.Parameter?.Value)
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
  return Sentry.AWSLambda.wrapHandler(serverlessExpress({ app }))
}

const handlerPromise = initialize()

export const handler: Handler = async (...args) => (await handlerPromise)(...args)
