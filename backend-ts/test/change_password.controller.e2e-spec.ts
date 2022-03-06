import * as cuid from 'cuid';
import { getTestUtils, TestUtils } from './utils';

describe('ChangePasswordController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`change password`, async () => {
    const user = await utils.factory.newUser()
    const oldPassword = cuid()
    await utils.changePassword(user, oldPassword)
    const newPassword = cuid()

    {
      const params = {
        oldPassword,
        newPassword,
      }
      const res = await utils.getHttpClientForUser(user)
        .post('/api/v4/ChangePassword')
        .send(params)
      expect(res.status).toBe(200)
      expect(res.body.ok).toBe(true)
    }

    // new password = ok
    {
      const params = {
        username: user.username,
        password: newPassword,
        persistent: true,
      }
      const res = await utils.getHttpClient()
        .post('/api/v4/Authenticate')
        .send(params)
      expect(res.status).toBe(200)
    }

    // old password = fail
    {
      const params = {
        username: user.username,
        password: oldPassword,
        persistent: true,
      }
      const res = await utils.getHttpClient()
        .post('/api/v4/Authenticate')
        .send(params)
      expect(res.status).not.toBe(200)
    }
  });

  it(`wrong password`, async () => {
    const user = await utils.factory.newUser()
    const oldPassword = cuid()
    await utils.changePassword(user, oldPassword)
    const newPassword = cuid()

    const params = {
      oldPassword: oldPassword + '.',
      newPassword,
    }
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/ChangePassword')
      .send(params)
    expect(res.status).not.toBe(200)
  });
});
