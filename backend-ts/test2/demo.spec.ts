import endpoint from 'src2/endpoints/admin/v1/WorkDetail/'
import { createConnection } from 'typeorm'

test('inject', async () => {
  await createConnection({
    "type": "postgres",
    "url": process.env.DATABASE_URL,
    "entities": ["dist/**/*.entity{.ts,.js}"],
    // "logging": true,
  })
  const resp = await endpoint({ id: '1' })
  console.log(resp)
})
