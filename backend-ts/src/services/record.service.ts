import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as DataLoader from "dataloader";
import { ApiException } from "src/controllers/exceptions";
import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { objResults } from "src/utils/dataloader";
import { EntityManager, Repository } from "typeorm";
import { ValidationError } from "./exceptions";

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

  async addHistory(em: EntityManager, record: Record, params: {
    status: string;
    statusType: StatusType;
    comment: string;
    containsSpoiler: boolean;
    rating: number | null;
  }): Promise<History> {
    if (params.rating != null && ![1, 2, 3, 4, 5].includes(params.rating))
      throw new ValidationError('별점은 1부터 5까지 입력할 수 있습니다.')

    const history = new History()
    history.user_id = record.user_id
    history.work_id = record.work_id
    history.record = record
    history.status = params.status
    history.status_type = params.statusType
    history.comment = params.comment
    history.contains_spoiler = params.containsSpoiler
    history.updated_at = new Date()
    history.rating = params.rating
    await em.save(history)

    record.status_type = history.status_type
    record.status = history.status
    record.updated_at = history.updated_at
    await em.save(record)

    return history
  }
}
