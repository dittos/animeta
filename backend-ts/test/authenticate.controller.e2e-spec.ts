import { HttpStatus } from '@nestjs/common';
import * as cuid from 'cuid';
import { UserDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('AuthenticateController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`authenticate`, async () => {
    const user = await utils.factory.newUser()
    const password = cuid()
    await utils.changePassword(user, password)

    let _sessionKey: string
    {
      const params = {
        username: user.username,
        password,
        persistent: false,
      }
      const res = await utils.getHttpClient()
        .post('/api/v4/Authenticate')
        .send(params)
      expect(res.status).toBe(200)
      const {sessionKey, expiryMs} = res.body
      expect(sessionKey).not.toBe('')
      expect(expiryMs).toBeNull()
      _sessionKey = sessionKey
    }
    
    {
      const res = await utils.getHttpClientWithSessionKey(_sessionKey)
        .get('/api/v4/me')
        .send()
      expect(res.status).toBe(200)
      expect((res.body as UserDTO).id).toBe(user.id)
    }
  });
  
  it(`authenticate persistent`, async () => {
    const user = await utils.factory.newUser()
    const password = cuid()
    await utils.changePassword(user, password)

    let _sessionKey: string
    {
      const params = {
        username: user.username,
        password,
        persistent: true,
      }
      const res = await utils.getHttpClient()
        .post('/api/v4/Authenticate')
        .send(params)
      expect(res.status).toBe(200)
      const {sessionKey, expiryMs} = res.body
      expect(sessionKey).not.toBe('')
      expect(expiryMs).toBeGreaterThan(0)
      _sessionKey = sessionKey
    }
    
    {
      const res = await utils.getHttpClientWithSessionKey(_sessionKey)
        .get('/api/v4/me')
        .send()
      expect(res.status).toBe(200)
      expect((res.body as UserDTO).id).toBe(user.id)
    }
  });

  it(`wrong password`, async () => {
    const user = await utils.factory.newUser()
    const password = cuid()
    await utils.changePassword(user, password)

    const params = {
      username: user.username,
      password: password + '.',
      persistent: false,
    }
    const res = await utils.getHttpClient()
      .post('/api/v4/Authenticate')
      .send(params)
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
  });
});
