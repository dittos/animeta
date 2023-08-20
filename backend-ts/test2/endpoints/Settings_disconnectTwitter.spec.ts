import { getTestUtils, TestUtils } from '../utils';
import { TwitterSetting } from 'src/entities/twitter_setting.entity';
import { db } from 'src2/database';

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('disconnect twitter', async () => {
  const user = await utils.factory.newUser()
  const client = utils.getHttpClientForUser(user)
  await db.save(TwitterSetting, {
    user,
    key: "key",
    secret: "secret",
  })
  
  const res = await client.call('/api/v5/Settings/disconnectTwitter', {})
  expect(res.statusCode).toBe(200)
  expect(res.json()).toEqual({ ok: true })
  
  expect(await db.findOne(TwitterSetting, { where: {user} })).toBeFalsy()
})
