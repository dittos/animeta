import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { CACHE_MANAGER, INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TestUtils } from './utils';
import { TestFactoryUtils } from './factory';
import { caching } from 'cache-manager';
import * as cookieParser from 'cookie-parser';

export async function getApp(testingModuleBuilderCustomizer: (tmb: TestingModuleBuilder) => TestingModuleBuilder): Promise<INestApplication> {
  let tmb = Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env.test',
      }),
      AppModule,
      TypeOrmModule.forRoot({
        "type": "postgres",
        "url": process.env.DATABASE_URL,
        "entities": ["src/**/*.entity{.ts,.js}"],
        // "logging": true,
      }),
    ],
    providers: [
      TestUtils,
      TestFactoryUtils,
    ]
  })
  tmb = testingModuleBuilderCustomizer(tmb)
  tmb = tmb.overrideProvider(CACHE_MANAGER).useValue(caching({ store: 'none', ttl: 0 }))
  const moduleRef = await tmb.compile();

  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  await app.init();
  return app;
}
