import { db } from "src2/database";
import { createConnection, IsNull, Not } from "typeorm";
import * as Sentry from '@sentry/node';
import { Work } from "src/entities/work.entity";
import * as tempy from "tempy";
import * as fs from 'fs'
import * as path from "path";
import { Storage } from "@google-cloud/storage";
import { Temporal } from "@js-temporal/polyfill";

Sentry.init()

async function dumpWork(tempDir: string) {
  const works = await db.find(Work, {
    where: {
      metadata: Not(IsNull())
    }
  })

  {
    const handle = await fs.promises.open(path.join(tempDir, 'work.ndjson'), 'w')
    for (const work of works) {
      await handle.write(JSON.stringify({ id: work.id, canonicalTitle: work.title, ...work.metadata }))
      await handle.write('\n')
    }
    await handle.close()
  }
}

async function main() {
  console.info('Starting dump')
  
  const conn = await createConnection()
  try {
    const tempDir = tempy.directory()
    await dumpWork(tempDir)

    const storage = new Storage()
    const bucket = storage.bucket('animeta-dump')
    const files = await fs.promises.readdir(tempDir)
    const date = Temporal.Now.plainDateISO('Asia/Seoul').toString()
    for (const filename of files) {
      console.log(`Uploading ${filename}`)
      await bucket.upload(path.join(tempDir, filename), {destination: `${date}/${filename}`})
    }

    console.info('Done')
  } finally {
    await conn.close()
  }
}

main().catch(e => {
  console.error(e)
  Sentry.captureException(e)
})
