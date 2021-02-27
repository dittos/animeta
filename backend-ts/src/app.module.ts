import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchController } from './controllers/search.controller';
import { History } from './entities/history.entity';
import { Record } from './entities/record.entity';
import { User } from './entities/user.entity';
import { SearchService } from './services/search.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      Record,
      History,
    ]),
  ],
  controllers: [
    SearchController,
  ],
  providers: [
    SearchService,
  ],
})
export class AppModule {}
