import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as DataLoader from "dataloader";
import { Record } from "src/entities/record.entity";
import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { objResults } from "src/utils/dataloader";
import { Repository } from "typeorm";

@Injectable()
export class RecordService {
  private dataLoader = new DataLoader<number, Record>(
    objResults(ids => this.load(ids), k => `${k}`, v => `${v.id}`),
    { cache: false }
  );
  private userAndWorkDataLoader = new DataLoader<{userId: number, workId: number}, Record>(
    objResults(keys => this.loadByUserAndWork(keys), k => `${k.userId}:${k.workId}`, record => `${record.user.id}:${record.work_id}`),
    { cache: false }
  );

  constructor(
    @InjectRepository(Record) private recordRepository: Repository<Record>,
  ) {}

  get(id: number): Promise<Record> {
    return this.dataLoader.load(id);
  }

  findByUserAndWork(user: User, work: Work): Promise<Record | null> {
    return this.userAndWorkDataLoader.load({ userId: user.id, workId: work.id });
  }

  findByUserAndWorkId(user: User, workId: number): Promise<Record | null> {
    return this.userAndWorkDataLoader.load({ userId: user.id, workId });
  }

  private async load(ids: readonly number[]): Promise<Record[]> {
    return this.recordRepository.findByIds(Array.from(ids));
  }

  private async loadByUserAndWork(userAndWorks: readonly {userId: number, workId: number}[]): Promise<(Record | null)[]> {
    return this.recordRepository.createQueryBuilder('record')
      .innerJoinAndSelect('record.user', 'user')
      .where(`(record.user_id, record.work_id) IN (${userAndWorks.map(it => `(${it.userId}, ${it.workId})`).join(',')})`)
      .getMany();
  }
}
