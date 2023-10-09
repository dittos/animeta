import { Temporal } from "@js-temporal/polyfill";
import * as DataLoader from "dataloader";
import { Category } from "src/entities/category.entity";
import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { PermissionError, ValidationError } from "src/services/exceptions";
import { countRecordsForFilter as _countRecordsForFilter } from "src/services/user_records.service";
import { objResults } from "src/utils/dataloader";
import { db } from "src2/database";
import { LessThanOrEqual, MoreThan } from "typeorm";

const INVALID_RATING_ERROR_MESSAGE = '별점은 0.5부터 5까지 0.5 단위로 입력할 수 있습니다.'

const dataLoader = new DataLoader<number, Record>(
  objResults(ids => db.findByIds(Record, Array.from(ids)), k => `${k}`, v => `${v.id}`),
  { cache: false }
)
const userAndWorkDataLoader = new DataLoader<{userId: number, workId: number}, Record>(
  objResults(keys => loadByUserAndWork(keys), k => `${k.userId}:${k.workId}`, record => `${record.user_id}:${record.work_id}`),
  { cache: false }
);

export async function getRecord(id: number): Promise<Record> {
  return dataLoader.load(id)
}

export async function getRecordByUserAndWork(user: User, work: Work): Promise<Record | null> {
  return userAndWorkDataLoader.load({ userId: user.id, workId: work.id })
}

async function loadByUserAndWork(userAndWorks: readonly {userId: number, workId: number}[]): Promise<(Record | null)[]> {
  return db.createQueryBuilder()
    .from(Record, 'record')
    .select('record')
    .where(`(record.user_id, record.work_id) IN (${userAndWorks.map(it => `(${it.userId}, ${it.workId})`).join(',')})`)
    .getMany()
}

export async function createRecord(user: User, work: Work, params: {
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
  const category = params.categoryId ? await db.findOne(Category, params.categoryId) : null
  if (category != null && user.id !== category.user_id)
    throw new PermissionError()
  const existingRecord = await db.findOne(Record, { where: {user, work_id: work.id} })
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
  await db.save(record)

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
  await db.save(history)

  return { record, history }
}

export async function addRecordHistory(record: Record, params: {
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
  await db.save(history)

  record.status_type = history.status_type
  record.status = history.status
  record.updated_at = history.updated_at
  await db.save(record)

  return history
}

export async function deleteRecordHistory(history: History) {
  const record = history.record
  if (await db.count(History, { where: { record } }) === 1)
    throw new ValidationError('등록된 작품마다 최소 1개의 기록이 필요합니다.')
  await db.remove(history)

  const latestHistory = (await db.find(History, {
    where: {record},
    order: {id: 'DESC'},
    take: 1,
  }))[0]
  record.status = latestHistory.status
  record.status_type = latestHistory.status_type
  await db.save(record)
}

function isValidRating(rating: number) {
  return [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].includes(rating)
}

export async function updateRecordWorkAndTitle(record: Record, work: Work, title: string) {
  if (record.work_id !== work.id) {
    const existingRecord = await db.findOne(Record, { where: {user_id: record.user_id, work_id: work.id} })
    if (existingRecord != null)
      throw new ValidationError(`이미 등록된 작품입니다. (${existingRecord.title})`)

    record.work_id = work.id
  }

  record.title = title
  await db.save(record)
  await db.update(History, {record}, {work_id: work.id})
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

export async function deleteRecord(record: Record) {
  await db.delete(History, {record})
  await db.remove(record)
}

function getUnratedRecordFindCondition(user: User) {
  return {
    user_id: user.id,
    rating: null,
    status_type: StatusType.FINISHED,
  }
}

export async function getUnratedRecords(user: User, count: number, maxId: number | null): Promise<Record[]> {
  return db.find(Record, {
    where: {
      ...getUnratedRecordFindCondition(user),
      ...(maxId ? {id: LessThanOrEqual(maxId)} : {}),
    },
    order: {
      id: 'DESC',
    },
    take: count,
  })
}

export async function getUnratedRecordCount(user: User): Promise<number> {
  return db.count(Record, {
    where: getUnratedRecordFindCondition(user),
  })
}

// 이게 여기있는게 맞나...
export async function getUserRecords(user: User, {
  statusType,
  categoryId,
  orderBy,
  limit,
}: {
  statusType: StatusType | null,
  categoryId: number | null,
  orderBy: 'DATE' | 'TITLE' | 'RATING' | null,
  limit: number | null,
}): Promise<{ nodes: Record[] }> {
  const nodes = await db.find(Record, {
    where: {
      user,
      ...statusType != null ? { status_type: statusType } : {},
      ...categoryId != null ? {
        category_id: categoryId !== 0 ? categoryId : null
      } : {},
    },
    order: orderBy === 'TITLE' ? { title: 'ASC' } :
    orderBy === 'RATING' ? { rating: 'DESC', updated_at: 'DESC' } :
      /* orderBy === 'DATE' || !sort */ { updated_at: 'DESC' },
    ...limit ? { take: limit } : {},
  })
  return { nodes }
}

export async function countRecordsForFilter(user: User, {
  statusType,
  categoryId,
}: {
  statusType: StatusType | null,
  categoryId: number | null,
}) {
  return _countRecordsForFilter(
    db.createQueryBuilder(Record, 'r'),
    user,
    statusType,
    categoryId,
  )
}

const HAS_NEWER_EPISODE_AGE_THRESHOLD = Temporal.Duration.from({days: 100})

export async function hasNewerEpisode(record: Record): Promise<boolean> {
  if (record.status_type !== StatusType.WATCHING)
    return false
  
  if (!/^[0-9]+$/.test(record.status))
    return false
  const episode = Number(record.status)

  if (!record.updated_at)
    return false
  
  const updatedAt = Temporal.Instant.fromEpochMilliseconds(record.updated_at.getTime())
  const age = Temporal.Now.instant().since(updatedAt)
  if (Temporal.Duration.compare(age, HAS_NEWER_EPISODE_AGE_THRESHOLD) >= 0)
    return false

  return (await db.count(History, {
    where: {
      work_id: record.work_id,
      status: `${episode + 1}`,
      updated_at: MoreThan(record.updated_at),
    },
    take: 1,
  })) > 0
}
