import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

describe('UserController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          "type": "postgres",
          "url": process.env.DATABASE_URL,
          "entities": ["src/**/*.entity{.ts,.js}"],
          "migrations": ["migrations/*.ts"],
          "migrationsRun": true,
        }),
      ],
    })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`get non-existent user`, () => {
    return request(app.getHttpServer())
      .get('/api/v4/users/nobody')
      .expect(404);
  });

  it(`get user`, async () => {
    const userRepository = app.get<Repository<User>>(getRepositoryToken(User))
    const user = await userRepository.save({
      username: `u${Date.now()}`,
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      is_staff: false,
      is_active: true,
      is_superuser: false,
      last_login: null,
      date_joined: new Date(),
    });
    return request(app.getHttpServer())
      .get(`/api/v4/users/${user.username}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
