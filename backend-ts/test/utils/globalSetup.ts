import * as dotenv from 'dotenv';
import pgTestSetup from '@databases/pg-test/jest/globalSetup';
import { createConnection } from 'typeorm';

let dotenvLoaded = false

export default async function setup(opts: any) {
  if (!dotenvLoaded) {
    dotenv.config({
      path: __dirname + '/../.env.test',
      debug: true,
    })
    dotenvLoaded = true
  }

  if (process.env.DATABASE_URL) return

  await pgTestSetup(opts)

  // run migrations
  const connection = await createConnection({
    "type": "postgres",
    "url": process.env.DATABASE_URL,
    "migrations": ["migrations/*.{ts,js}"],
    "migrationsRun": true,
  })
  await connection.close()

  // XXX: avoid typeorm global state being reused in actual tests
  delete (global as any).typeormMetadataArgsStorage
}
