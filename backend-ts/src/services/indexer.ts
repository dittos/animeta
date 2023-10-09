import { Work } from "src/entities/work.entity";
import { WorkIndex } from "src/entities/work_index.entity";
import { db } from "src/database";

export async function rebuildWorkIndex() {
  const recordCounts: {work_id: number; c: number}[] = await db.query(`
    SELECT work_id, COUNT(*) as c
    FROM record_record
    GROUP BY work_id
  `)
  const recordCountsMap = new Map()
  for (const {work_id, c} of recordCounts) {
    recordCountsMap.set(work_id, c)
  }
  const works = await db.find(Work)
  console.info(`[WorkIndex] creating ${works.length}`)
  await db.transaction(async () => {
    await db.delete(WorkIndex, {})
    let batch: WorkIndex[] = []
    for (const work of works) {
      const index = new WorkIndex()
      index.work_id = work.id
      index.title = work.title
      index.record_count = recordCountsMap.get(work.id) ?? 0
      index.rank = 0
      index.blacklisted = work.blacklisted
      index.verified = work.metadata != null
      batch.push(index)
      if (batch.length >= 1024) {
        await db.save(batch)
        batch = []
      }
    }
    if (batch.length > 0) {
      await db.save(batch)
    }
  })
}
