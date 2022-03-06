import { HttpStatus } from '@nestjs/common';
import * as cuid from 'cuid';
import { UserDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('CreateAccountController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`create account`, async () => {
    const username = cuid()
    const password = cuid()

    let _sessionKey: string
    {
      const params = {
        username,
        password1: password,
        password2: password,
      }
      const res = await utils.getHttpClient()
        .post('/api/v4/CreateAccount')
        .send(params)
      expect(res.status).toBe(201)
      const {sessionKey, expiryMs} = res.body.authResult
      expect(sessionKey).not.toBe('')
      expect(expiryMs).toBeNull()
      _sessionKey = sessionKey
    }
    
    {
      const res = await utils.getHttpClientWithSessionKey(_sessionKey)
        .get('/api/v4/me')
        .send()
      expect(res.status).toBe(200)
      expect((res.body as UserDTO).name).toBe(username)
    }
  });
  
  it(`create account with existing user name fails`, async () => {
    const existingUser = await utils.factory.newUser()
    const password = cuid()

    const params = {
      username: existingUser.username,
      password1: password,
      password2: password,
    }
    const res = await utils.getHttpClient()
      .post('/api/v4/CreateAccount')
      .send(params)
    expect(res.status).toBe(HttpStatus.BAD_REQUEST)
  });
});
