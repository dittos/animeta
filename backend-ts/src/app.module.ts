import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthMiddleware } from './auth/auth.middleware';
import { AuthController } from './controllers/auth.controller';
import { SearchController } from './controllers/search.controller';
import { History } from './entities/history.entity';
import { Record } from './entities/record.entity';
import { User } from './entities/user.entity';
import { SearchService } from './services/search.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      Record,
      History,
    ]),
  ],
  controllers: [
    SearchController,
    AuthController,
  ],
  providers: [
    SearchService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(':any*')
  }
}
