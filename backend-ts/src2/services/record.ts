import { Temporal } from "@js-temporal/polyfill";
import * as DataLoader from "dataloader";
import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { countRecordsForFilter as _countRecordsForFilter } from "src/services/user_records.service";
import { objResults } from "src/utils/dataloader";
import { db } from "src2/database";
import { LessThanOrEqual, MoreThan } from "typeorm";

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
