import { Type } from "@sinclair/typebox";
import { Record } from "src/entities/record.entity";
import { Work } from "src/entities/work.entity";
import { WorkIndex } from "src/entities/work_index.entity";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";

const Params = Type.Object({
  orphans: Type.Boolean({default: false}),
  offset: Type.Number({default: 0}),
})

const Result = Type.Array(Type.Object({
  id: Type.String(),
  title: Type.String(),
  record_count: Type.Number(),
}))

export default createEndpoint(Params, Result, async (params) => {
  const works = await db.find(Work, {
    where: {
      blacklisted: false,
      // TODO: onlyOrphans
    },
    order: {id: 'DESC'},
    skip: params.offset,
    take: 50,
  })
  return Promise.all(works.map(async it => ({
    id: it.id.toString(),
    title: it.title,
    record_count: await getRecordCount(it),
  })))
})

async function getRecordCount(work: Work): Promise<number> {
  // TODO: batching
  const index = await db.findOne(WorkIndex, {where: {work_id: work.id}})
  if (index) return index.record_count
  return db.count(Record, {where: {work_id: work.id}})
}
