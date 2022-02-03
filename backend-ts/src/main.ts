import { NestFactory } from '@nestjs/core';
import { AppProdModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppProdModule);
  app.enableShutdownHooks();
  await app.listen(8081);
}
bootstrap();
