import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as cuid from "cuid";
import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { TitleMapping } from "src/entities/title_mapping.entity";
import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { makeKey } from "src/services/search.service";
import { Repository } from "typeorm";

@Injectable()
export class TestFactoryUtils {  
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Work) private workRepository: Repository<Work>,
    @InjectRepository(TitleMapping) private titleMappingRepository: Repository<TitleMapping>,
    @InjectRepository(Record) private recordRepository: Repository<Record>,
    @InjectRepository(History) private historyRepository: Repository<History>,
  ) {}

  async newUser(): Promise<User> {
    return await this.userRepository.save({
      username: cuid(),
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      is_staff: false,
      is_active: true,
      is_superuser: false,
      last_login: new Date(),
      date_joined: new Date(),
    });
  }

  async newWork(): Promise<Work> {
    const work = await this.workRepository.save({
      title: cuid(),
      image_center_y: 0.0,
      blacklisted: false,
      metadata: {
        version: 2,
      }
    });
    await this.titleMappingRepository.save({
      work_id: work.id,
      title: work.title,
      key: work.title, // TODO
    })
    // TODO: create WorkIndex
    return work
  }

  async newRecord({
    user,
    work,
    comment,
  }: {
    user?: User,
    work?: Work,
    comment?: string,
  } = {}): Promise<{ record: Record, history: History }> {
    if (!work) work = await this.newWork()
    const record = await this.recordRepository.save({
      user: user ?? await this.newUser(),
      work_id: work.id,
      title: work.title,
      status: '1',
      status_type: StatusType.FINISHED,
      category_id: null,
      updated_at: new Date(),
      rating: null,
    })
    // TODO: update WorkIndex
    const history = await this.historyRepository.save({
      user: record.user,
      work_id: record.work_id,
      record,
      status: record.status,
      status_type: record.status_type,
      updated_at: record.updated_at,
      comment: comment ?? '',
      contains_spoiler: false,
      rating: null,
    })
    return { record, history }
  }

  async deleteAllRecords() {
    await this.historyRepository.delete({})
    await this.recordRepository.delete({})
    // TODO: update WorkIndex
  }
}
