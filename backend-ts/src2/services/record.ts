import * as DataLoader from "dataloader";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { objResults } from "src/utils/dataloader";
import { db } from "src2/database";
import { FindConditions, LessThanOrEqual } from "typeorm";

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
