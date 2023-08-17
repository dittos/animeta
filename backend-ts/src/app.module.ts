import { CacheModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from './auth/auth.middleware';
import { SearchController } from './controllers/search.controller';
import { Category } from './entities/category.entity';
import { History } from './entities/history.entity';
import { Record } from './entities/record.entity';
import { TwitterSetting } from './entities/twitter_setting.entity';
import { User } from './entities/user.entity';
import { SearchService } from './services/search.service';
import { Work } from './entities/work.entity';
import { WorkIndex } from './entities/work_index.entity';
import { RecordService } from './services/record.service';
import { WorkService } from './services/work.service';
import { UserSerializer } from './serializers/user.serializer';
import { CategorySerializer } from './serializers/category.serializer';
import { UserController } from './controllers/user.controller';
import { CurrentUserController } from './controllers/current_user.controller';
import { AppController } from './app.controller';
import { PostSerializer } from './serializers/post.serializer';
import { RecordSerializer } from './serializers/record.serializer';
import { UserService } from './services/user.service';
import { RecordController } from './controllers/record.controller';
import { RecordPostsController } from './controllers/record_posts.controller';
import { UserPostsController } from './controllers/user_posts.controller';
import { UserRecordsService } from './services/user_records.service';
import { UserRecordsController } from './controllers/user_records.controller';
import { TitleMapping } from './entities/title_mapping.entity';
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
import { WorkCast } from './entities/work_cast.entity';
import { WorkTitleIndex } from './entities/work_title_index.entity';
import { WorkPeriodIndex } from './entities/work_period_index.entity';
import { Company } from './entities/company.entity';
import { WorkCompany } from './entities/work_company.entity';
import { CompanyAnnIds } from './entities/company_ann_ids.entity';
import { CreateCategoryController } from './controllers/create_category.controller';
import { UpdateCategoryOrderController } from './controllers/update_category_order.controller';
import { DeleteCategoryController } from './controllers/delete_category.controller';
import { UpdateCategoryController } from './controllers/update_category.controller';
import { DisconnectTwitterController } from './controllers/disconnect_twitter.controller';
import { CreateBackupController } from './controllers/create_backup.controller';
import { BackupService } from './services/backup.service';

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
      WorkCast,
      WorkTitleIndex,
      WorkPeriodIndex,
      Company,
      WorkCompany,
      CompanyAnnIds,
    ]),
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
    RecordController,
    RecordPostsController,
    UserPostsController,
    UserRecordsController,
    ExternalServicesController,
    CreatePostController,
    DeletePostController,
    CreateRecordController,
    UpdateRecordController,
    DeleteRecordController,
    AuthenticateController,
    ChangePasswordController,
    CreateAccountController,
    CreateCategoryController,
    UpdateCategoryController,
    DeleteCategoryController,
    UpdateCategoryOrderController,
    DisconnectTwitterController,
    CreateBackupController,
  ],
  providers: [
    SearchService,
    RecordService,
    WorkService,
    UserService,
    UserRecordsService,
    TwitterService,
    TwitterApiService,
    CategoryService,
    AuthService,
    BackupService,

    UserSerializer,
    CategorySerializer,
    PostSerializer,
    RecordSerializer,

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
