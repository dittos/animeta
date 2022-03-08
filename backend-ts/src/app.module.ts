import { CacheModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
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
import { ChartController } from './controllers/chart.controller';
import { ChartService } from './services/chart.service';
import { AppController } from './app.controller';
import { PostsController } from './controllers/posts.controller';
import { PostSerializer } from './serializers/post.serializer';
import { RecordSerializer } from './serializers/record.serializer';
import { UserService } from './services/user.service';
import { PostController } from './controllers/post.controller';
import { RecordController } from './controllers/record.controller';
import { RecordPostsController } from './controllers/record_posts.controller';
import { UserPostsController } from './controllers/user_posts.controller';
import { UserRecordsService } from './services/user_records.service';
import { UserRecordsController } from './controllers/user_records.controller';
import { WorkPostsController } from './controllers/work_posts.controller';
import { WorkController } from './controllers/work.controller';
import { WorkSerializer } from './serializers/work.serializer';
import { TitleMapping } from './entities/title_mapping.entity';
import { WorkByTitleController } from './controllers/work_by_title.controller';
import { TablePeriodController } from './controllers/table_period.controller';
import { RecommendationService } from './services/recommendation.service';
import { WorkStaff } from './entities/work_staff.entity';
import { Person } from './entities/person.entity';
import { ExternalServicesController } from './controllers/external_services.controller';
import { TwitterService } from './services/twitter.service';
import { TwitterApiService } from './services/twitter_api.service';
import { CreatePostController } from './controllers/create_post.controller';
import { DeletePostController } from './controllers/delete_post.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ServiceExceptionInterceptor } from './controllers/service_exception.interceptor';
import { CreateRecordController } from './controllers/create_record.controller';
import { CategoryService } from './services/category.service';
import { UpdateRecordController } from './controllers/update_record.controller';
import { DeleteRecordController } from './controllers/delete_record.controller';
import { AuthService } from './services/auth.service';
import { AuthenticateController } from './controllers/authenticate.controller';
import { ChangePasswordController } from './controllers/change_password.controller';
import { CreateAccountController } from './controllers/create_account.controller';
import { AdminCachesController } from './controllers/admin/caches.controller';

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
      TitleMapping,
      WorkStaff,
      Person,
    ]),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      path: '/api/graphql',
      typePaths: ['./**/*.graphql'],
      // Generating definitions is slow, so disable in the test
      definitions: process.env.NODE_ENV !== 'test' ? {
        path: path.join(process.cwd(), 'src/graphql.ts'),
      } : undefined,
      // debug: true,
    }),
    CacheModule.register(),
  ],
  exports: [
    TypeOrmModule,

    RecordService,
    WorkService,
    CategoryService,
    AuthService,
  ],
  controllers: [
    AppController,
    
    SearchController,
    UserController,
    CurrentUserController,
    ChartController,
    PostsController,
    PostController,
    RecordController,
    RecordPostsController,
    UserPostsController,
    UserRecordsController,
    WorkPostsController,
    WorkController,
    WorkByTitleController,
    TablePeriodController,
    ExternalServicesController,
    CreatePostController,
    DeletePostController,
    CreateRecordController,
    UpdateRecordController,
    DeleteRecordController,
    AuthenticateController,
    ChangePasswordController,
    CreateAccountController,

    AdminCachesController,
  ],
  providers: [
    SearchService,
    CuratedListService,
    RecordService,
    WorkService,
    ChartService,
    UserService,
    UserRecordsService,
    RecommendationService,
    TwitterService,
    TwitterApiService,
    CategoryService,
    AuthService,

    UserResolver,
    RecordResolver,
    WorkResolver,
    CuratedListResolver,

    UserSerializer,
    CategorySerializer,
    PostSerializer,
    RecordSerializer,
    WorkSerializer,

    {
      provide: APP_INTERCEPTOR,
      useClass: ServiceExceptionInterceptor,
    },
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
