import { TitleMapping } from "src/entities/title_mapping.entity";
import { WorkTitleIndex } from "src/entities/work_title_index.entity";
import { makeKey } from "src/services/search.service";
import { db } from "src2/database";
import { createConnection } from "typeorm";
import * as Sentry from '@sentry/node';
import { rebuildWorkIndex } from "src2/services/indexer";

Sentry.init()

async function main() {
  console.info('Starting indexer')
  
  const conn = await createConnection()
  try {
    await rebuildWorkIndex()

    const titleMappings = await db.find(TitleMapping)
    console.info(`[WorkTitleIndex] creating ${titleMappings.length}`)
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

    console.info('Done')
  } finally {
    await conn.close()
  }
}

main().catch(e => Sentry.captureException(e))
