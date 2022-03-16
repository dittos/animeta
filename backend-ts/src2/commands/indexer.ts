import { TitleMapping } from "src/entities/title_mapping.entity";
import { Work } from "src/entities/work.entity";
import { WorkIndex } from "src/entities/work_index.entity";
import { WorkTitleIndex } from "src/entities/work_title_index.entity";
import { makeKey } from "src/services/search.service";
import { db } from "src2/database";
import { createConnection } from "typeorm";

async function main() {
  const conn = await createConnection()
  try {
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

    const titleMappings = await db.find(TitleMapping)
    await db.transaction(async () => {
      await db.delete(WorkTitleIndex, {})
      let batch: WorkTitleIndex[] = []
      for (const mapping of titleMappings) {
        const index = new WorkTitleIndex()
        index.key = makeKey(mapping.title).join('')
        index.work_id = mapping.work_id
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
  } finally {
    await conn.close()
  }
}

main()
