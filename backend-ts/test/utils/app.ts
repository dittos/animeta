import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TestUtils } from './utils';
import { TestFactoryUtils } from './factory';

export async function getApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
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
    .compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}
