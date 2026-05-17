import { getTestUtils, TestUtils } from '../utils';

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('disconnect twitter', async () => {
  const user = await utils.factory.newUser()
  const client = utils.getHttpClientForUser(user)
  await utils.factory.createTwitterSetting(user)

  const res = await client.call('/api/v5/Settings/disconnectTwitter', {})
  expect(res.statusCode).toBe(200)
  expect(res.json()).toEqual({ ok: true })

  expect(await utils.factory.getTwitterSetting(user)).toBeFalsy()
})
