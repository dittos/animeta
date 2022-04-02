import { Record } from "src/entities/record.entity";
import { Work } from "src/entities/work.entity";
import { WorkIndex } from "src/entities/work_index.entity";
import { db } from "src2/database";

export default async function(params: {
  orphans?: boolean;
  offset?: number;
}): Promise<{
  id: string;
  title: string;
  record_count: number;
}[]> {
  const works = await db.find(Work, {
    where: {
      blacklisted: false,
      // TODO: onlyOrphans
    },
    order: {id: 'DESC'},
    skip: params.offset ?? 0,
    take: 50,
  })
  return Promise.all(works.map(async it => ({
    id: it.id.toString(),
    title: it.title,
    record_count: await getRecordCount(it),
  })))
}

async function getRecordCount(work: Work): Promise<number> {
  // TODO: batching
  const index = await db.findOne(WorkIndex, {where: {work_id: work.id}})
  if (index) return index.record_count
  return db.count(Record, {where: {work_id: work.id}})
}
