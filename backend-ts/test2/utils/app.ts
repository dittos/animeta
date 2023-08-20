import { FastifyInstance } from 'fastify';
import { createConnection } from 'typeorm';

export async function getApp(): Promise<FastifyInstance> {
  await createConnection({
    "type": "postgres",
    "url": process.env.DATABASE_URL,
    "entities": ["dist/**/*.entity{.ts,.js}"],
    // "logging": true,
  })

  const server = require('src2/server').server
  // tmb = tmb.overrideProvider(CACHE_MANAGER).useValue(caching({ store: 'none', ttl: 0 }))
  return server
}
