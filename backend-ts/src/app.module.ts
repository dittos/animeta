import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { AuthMiddleware } from './auth/auth.middleware';
import { SearchController } from './controllers/search.controller';
import { Category } from './entities/category.entity';
import { History } from './entities/history.entity';
import { Record } from './entities/record.entity';
import { TwitterSetting } from './entities/twitter_setting.entity';
import { User } from './entities/user.entity';
import { SearchService } from './services/search.service';
import * as path from 'path';
import { UserResolver } from './resolvers/user.resolver';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      TwitterSetting,
      Record,
      History,
      Category,
    ]),
    GraphQLModule.forRoot({
      path: '/api/graphql',
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: path.join(process.cwd(), 'src/graphql.ts'),
      },
    }),
  ],
  controllers: [
    SearchController,
  ],
  providers: [
    SearchService,
    UserResolver,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(':any*')
  }
}
