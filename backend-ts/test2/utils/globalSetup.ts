import pgTestSetup from '@databases/pg-test/jest/globalSetup';
import { createConnection } from 'typeorm';

export default async function setup(opts: any) {
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
}