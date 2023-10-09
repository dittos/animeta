import * as cuid from 'cuid';
import { getTestUtils, TestUtils } from '../utils';
import { changePassword } from 'src/services/auth';

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test(`change password`, async () => {
  const user = await utils.factory.newUser()
  const oldPassword = cuid()
  await changePassword(user, oldPassword)
  const newPassword = cuid()

  {
    const params = {
      oldPassword,
      newPassword,
    }
    const res = await utils.getHttpClientForUser(user)
      .call('/api/v5/Settings/changePassword', params)
    expect(res.statusCode).toBe(200)
    expect(res.json().ok).toBe(true)
  }

  // new password = ok
  {
    const params = {
      username: user.username,
      password: newPassword,
      persistent: true,
    }
    const res = await utils.getHttpClient()
      .call('/api/v5/LoginForm/authenticate', params)
    expect(res.statusCode).toBe(200)
  }

  // old password = fail
  {
    const params = {
      username: user.username,
      password: oldPassword,
      persistent: true,
    }
    const res = await utils.getHttpClient()
      .call('/api/v5/LoginForm/authenticate', params)
    expect(res.statusCode).not.toBe(200)
  }
});

test(`wrong password`, async () => {
  const user = await utils.factory.newUser()
  const oldPassword = cuid()
  await changePassword(user, oldPassword)
  const newPassword = cuid()

  const params = {
    oldPassword: oldPassword + '.',
    newPassword,
  }
  const res = await utils.getHttpClientForUser(user)
    .call('/api/v5/Settings/changePassword', params)
  expect(res.statusCode).not.toBe(200)
});
