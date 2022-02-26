import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as cuid from "cuid";
import { Category } from "src/entities/category.entity";
import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { TitleMapping } from "src/entities/title_mapping.entity";
import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { CategoryService } from "src/services/category.service";
import { RecordService } from "src/services/record.service";
import { WorkService } from "src/services/work.service";
import { Period } from "src/utils/period";
import { EntityManager, Repository } from "typeorm";

@Injectable()
export class TestFactoryUtils {  
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Work) private workRepository: Repository<Work>,
    @InjectRepository(TitleMapping) private titleMappingRepository: Repository<TitleMapping>,
    @InjectRepository(Record) private recordRepository: Repository<Record>,
    @InjectRepository(History) private historyRepository: Repository<History>,
    private entityManager: EntityManager,
    private recordService: RecordService,
    private workService: WorkService,
    private categoryService: CategoryService,
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

  async newCategory({
    user,
    name
  }: {
    user: User;
    name?: string;
  }): Promise<Category> {
    return this.categoryService.createCategory(user, {
      name: name ?? cuid()
    })
  }

  async newWork({
    periods
  }: {
    periods?: Period[];
  } = {}): Promise<Work> {
    const work = await this.workService.getOrCreate(cuid())
    work.metadata = {
      version: 2,
      ...periods ? { periods: periods.map(it => it.toString()) } : {},
    }
    if (periods)
      work.first_period = periods[0].toString()
    await this.workRepository.save(work)
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
    if (!user) user = await this.newUser()
    if (!work) work = await this.newWork()
    const {record, history} = await this.recordService.createRecord(this.entityManager, user, work, {
      title: work.title,
      status: '1',
      statusType: StatusType.FINISHED,
      comment: comment ?? '',
      categoryId: null,
      rating: null,
    })
    // TODO: update WorkIndex
    return { record, history }
  }
  
  async newHistory({
    user,
    work,
    record,
    comment,
  }: {
    user?: User,
    work?: Work,
    record?: Record,
    comment?: string,
  } = {}): Promise<History> {
    if (!record) record = (await this.newRecord({ user, work, comment })).record
    return this.recordService.addHistory(this.entityManager, record, {
      status: record.status,
      statusType: record.status_type,
      comment: comment ?? '',
      containsSpoiler: false,
      rating: null,
    })
  }

  async deleteAllRecords() {
    await this.historyRepository.delete({})
    await this.recordRepository.delete({})
    // TODO: update WorkIndex
  }

  async deleteAllWorks() {
    await this.deleteAllRecords() // hmm...
    await this.titleMappingRepository.delete({})
    await this.workRepository.delete({})
  }
}
