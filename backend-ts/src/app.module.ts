import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { History } from './entities/history.entity';
import { Record } from './entities/record.entity';
import { User } from './entities/user.entity';
import { RecordSerializer } from './serializers/record_serializer';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      Record,
      History,
    ]),
  ],
})
export class AppModule {}
