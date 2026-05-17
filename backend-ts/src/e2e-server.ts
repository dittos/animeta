import * as dotenv from 'dotenv';
import getTestDatabase from '@databases/pg-test';
import { Connection, createConnection } from 'typeorm';

dotenv.config({ path: 'test/.env.test' });

process.env.ANIMETA_ENABLE_TEST_API = process.env.ANIMETA_ENABLE_TEST_API ?? 'true';
process.env.ANIMETA_TEST_TOKEN = process.env.ANIMETA_TEST_TOKEN ?? 'test-token';

async function main() {
  const testDatabase = await getTestDatabase();
  let connection: Connection | null = null;

  try {
    process.env.DATABASE_URL = testDatabase.databaseURL;

    connection = await createConnection({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [`${__dirname}/**/*.entity{.ts,.js}`],
      migrations: ['migrations/*.{ts,js}'],
      migrationsRun: true,
    });

    const { server } = await import('./server');
    const port = Number(process.env.PORT ?? process.env.ANIMETA_PORT ?? 8082);
    const host = process.env.HOST ?? '0.0.0.0';
    const baseUrl = `http://localhost:${port}`;
    process.env.ANIMETA_BASE_URL = process.env.ANIMETA_BASE_URL ?? baseUrl;

    await new Promise<void>((resolve, reject) => {
      server.listen(port, host, err => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log(`E2E backend listening at ${baseUrl}`);
    console.log(`ANIMETA_BASE_URL=${baseUrl}`);
    console.log(`ANIMETA_TEST_TOKEN=${process.env.ANIMETA_TEST_TOKEN}`);

    let shuttingDown = false;
    async function shutdown() {
      if (shuttingDown) return;
      shuttingDown = true;
      await server.close();
      await connection?.close();
      await testDatabase.kill();
    }

    process.on('SIGINT', () => {
      shutdown().then(() => process.exit(0), err => {
        console.error(err);
        process.exit(1);
      });
    });
    process.on('SIGTERM', () => {
      shutdown().then(() => process.exit(0), err => {
        console.error(err);
        process.exit(1);
      });
    });
  } catch (e) {
    await connection?.close();
    await testDatabase.kill();
    throw e;
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
