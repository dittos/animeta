import * as dotenv from 'dotenv'
dotenv.config()

import { createConnection } from 'typeorm'
import * as Sentry from '@sentry/node'
import { server } from 'src/server'

async function main() {
  await createConnection()

  server.register(require('@immobiliarelabs/fastify-sentry'), {
    dsn: process.env.SENTRY_DSN,
  })
  
  server.listen(8082, '0.0.0.0', (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
}

main().catch(e => Sentry.captureException(e))
