import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as DataLoader from "dataloader";
import { Category } from "src/entities/category.entity";
import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { objResults } from "src/utils/dataloader";
import { EntityManager, Repository } from "typeorm";
import { PermissionError, ValidationError } from "./exceptions";
import { db } from "src2/database";

const INVALID_RATING_ERROR_MESSAGE = '별점은 0.5부터 5까지 0.5 단위로 입력할 수 있습니다.'

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
    @InjectRepository(Record) private recordRepository: Repository<Record>
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

  async createRecord(em: EntityManager, user: User, work: Work, params: {
    title: string;
    categoryId: number | null;
    status: string;
    statusType: StatusType;
    comment: string;
    rating: number | null;
  }): Promise<{ record: Record, history: History }> {
    return createRecord(em, user, work, params)
  }

  async addHistory(em: EntityManager, record: Record, params: {
    status: string;
    statusType: StatusType;
    comment: string;
    containsSpoiler: boolean;
    rating: number | null;
  }): Promise<History> {
    return addRecordHistory(em, record, params)
  }

  async updateRecordWorkAndTitle(em: EntityManager, record: Record, work: Work, title: string): Promise<void> {
    return updateRecordWorkAndTitle(em, record, work, title)
  }

  async updateCategory(record: Record, category: Category | null): Promise<void> {
    record.category_id = category?.id ?? null
    await this.recordRepository.save(record)
  }

  async updateRating(record: Record, rating: number | null): Promise<void> {
    if (rating != null && !isValidRating(rating)) {
      throw new ValidationError(INVALID_RATING_ERROR_MESSAGE)
    }
    record.rating = rating
    await this.recordRepository.save(record)
  }

  async delete(em: EntityManager, record: Record) {
    await em.delete(History, {record})
    await em.remove(record)
  }
}

export async function createRecord(em: EntityManager, user: User, work: Work, params: {
  title: string;
  categoryId: number | null;
  status: string;
  statusType: StatusType;
  comment: string;
  rating: number | null;
}): Promise<{ record: Record, history: History }> {
  if (params.title.trim() === '')
    throw new ValidationError('작품 제목을 입력하세요.')
  if (params.rating != null && !isValidRating(params.rating))
    throw new ValidationError(INVALID_RATING_ERROR_MESSAGE)
  const category = params.categoryId ? await em.findOne(Category, params.categoryId) : null
  if (category != null && user.id !== category.user_id)
    throw new PermissionError()
  const existingRecord = await em.findOne(Record, { where: {user, work_id: work.id} })
  if (existingRecord != null)
    throw new ValidationError(`이미 같은 작품이 "${existingRecord.title}"로 등록되어 있습니다.`)
  
  const record = new Record()
  record.user_id = user.id
  record.work_id = work.id
  record.title = params.title
  record.category_id = params.categoryId
  record.status = params.status
  record.status_type = params.statusType
  record.updated_at = new Date()
  record.rating = params.rating
  await em.save(record)

  const history = new History()
  history.user_id = record.user_id
  history.work_id = record.work_id
  history.record = record
  history.status = record.status
  history.status_type = record.status_type
  history.updated_at = record.updated_at
  history.comment = params.comment
  history.contains_spoiler = false
  history.rating = null // post should not inherit record rating
  await em.save(history)

  return { record, history }
}

export async function addRecordHistory(em: EntityManager, record: Record, params: {
  status: string;
  statusType: StatusType;
  comment: string;
  containsSpoiler: boolean;
  rating: number | null;
}): Promise<History> {
  if (params.rating != null && !isValidRating(params.rating))
    throw new ValidationError(INVALID_RATING_ERROR_MESSAGE)

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

function isValidRating(rating: number) {
  return [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].includes(rating)
}

export async function updateRecordWorkAndTitle(em: EntityManager, record: Record, work: Work, title: string) {
  record.work_id = work.id
  record.title = title
  await em.save(record)
  await em.update(History, {record}, {work_id: work.id})
}

export async function updateRecordCategory(record: Record, category: Category | null): Promise<void> {
  record.category_id = category?.id ?? null
  await db.save(record)
}

export async function updateRecordRating(record: Record, rating: number | null): Promise<void> {
  if (rating != null && !isValidRating(rating)) {
    throw new ValidationError(INVALID_RATING_ERROR_MESSAGE)
  }
  record.rating = rating
  await db.save(record)
}
