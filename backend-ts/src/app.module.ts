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
import { CuratedListResolver } from './resolvers/curated_list.resolver';
import { CuratedListService } from './services/curated_list.service';
import { Work } from './entities/work.entity';
import { WorkResolver } from './resolvers/work.resolver';
import { RecordResolver } from './resolvers/record.resolver';
import { WorkIndex } from './entities/work_index.entity';
import { RecordService } from './services/record.service';
import { WorkService } from './services/work.service';
import { UserSerializer } from './serializers/user.serializer';
import { CategorySerializer } from './serializers/category.serializer';
import { UserController } from './controllers/user.controller';
import { CurrentUserController } from './controllers/current_user.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      TwitterSetting,
      Record,
      History,
      Category,
      Work,
      WorkIndex,
    ]),
    GraphQLModule.forRoot({
      path: '/api/graphql',
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: path.join(process.cwd(), 'src/graphql.ts'),
      },
      // debug: true,
    }),
  ],
  exports: [
    TypeOrmModule,
  ],
  controllers: [
    SearchController,
    UserController,
    CurrentUserController,
  ],
  providers: [
    SearchService,
    CuratedListService,
    RecordService,
    WorkService,

    UserResolver,
    RecordResolver,
    WorkResolver,
    CuratedListResolver,

    UserSerializer,
    CategorySerializer,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(':any*')
  }
}

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppModule,
    TypeOrmModule.forRoot(),
  ]
})
export class AppProdModule {
}
