import { NestFactory } from '@nestjs/core';
import { AppProdModule } from './app.module';
import * as Sentry from '@sentry/node';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { SentryInterceptor } from './sentry.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppProdModule);
  const sentryDsn = app.get(ConfigService).get('SENTRY_DSN');
  if (sentryDsn) {
    Sentry.init({ dsn: sentryDsn });
  }
  app.useGlobalInterceptors(new SentryInterceptor());
  app.use(cookieParser());
  app.enableShutdownHooks();
  await app.listen(8081);
}
bootstrap();
