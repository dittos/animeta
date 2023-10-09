import { HttpStatus } from '@nestjs/common';
import * as cuid from 'cuid';
import { getTestUtils, TestUtils } from '../utils';
import { UserDto } from 'src/schemas/user';

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test(`create account`, async () => {
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
      .call('/api/v5/Signup/createAccount', params)
    expect(res.statusCode).toBe(200)
    const {sessionKey, expiryMs} = res.json().authResult
    expect(sessionKey).not.toBe('')
    expect(expiryMs).toBeNull()
    _sessionKey = sessionKey
  }
  
  {
    const res = await utils.getHttpClientWithSessionKey(_sessionKey)
      .call('/api/v5/getCurrentUser', {})
    expect(res.statusCode).toBe(200)
    expect((res.json() as UserDto).name).toBe(username)
  }
});

test(`create account with existing user name fails`, async () => {
  const existingUser = await utils.factory.newUser()
  const password = cuid()

  const params = {
    username: existingUser.username,
    password1: password,
    password2: password,
  }
  const res = await utils.getHttpClient()
    .call('/api/v5/Signup/createAccount', params)
  expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST)
});
