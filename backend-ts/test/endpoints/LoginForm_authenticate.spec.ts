import { HttpStatus } from '@nestjs/common';
import * as cuid from 'cuid';
import { getTestUtils, TestUtils } from '../utils';
import { changePassword } from 'src/services/auth';
import { UserDto } from 'src/schemas/user';

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test(`authenticate`, async () => {
  const user = await utils.factory.newUser()
  const password = cuid()
  await changePassword(user, password)

  let _sessionKey: string
  {
    const params = {
      username: user.username,
      password,
      persistent: false,
    }
    const res = await utils.getHttpClient()
      .call('/api/v5/LoginForm/authenticate', params)
    expect(res.statusCode).toBe(200)
    const {sessionKey, expiryMs} = res.json()
    expect(sessionKey).not.toBe('')
    expect(expiryMs).toBeNull()
    _sessionKey = sessionKey
  }
  
  {
    const res = await utils.getHttpClientWithSessionKey(_sessionKey)
      .call('/api/v5/getCurrentUser', {})
    expect(res.statusCode).toBe(200)
    expect((res.json() as UserDto).id).toBe(user.id.toString())
  }
});

test(`authenticate persistent`, async () => {
  const user = await utils.factory.newUser()
  const password = cuid()
  await changePassword(user, password)

  let _sessionKey: string
  {
    const params = {
      username: user.username,
      password,
      persistent: true,
    }
    const res = await utils.getHttpClient()
      .call('/api/v5/LoginForm/authenticate', params)
    expect(res.statusCode).toBe(200)
    const {sessionKey, expiryMs} = res.json()
    expect(sessionKey).not.toBe('')
    expect(expiryMs).toBeGreaterThan(0)
    _sessionKey = sessionKey
  }
  
  {
    const res = await utils.getHttpClientWithSessionKey(_sessionKey)
      .call('/api/v5/getCurrentUser', {})
    expect(res.statusCode).toBe(200)
    expect((res.json() as UserDto).id).toBe(user.id.toString())
  }
});

test(`wrong password`, async () => {
  const user = await utils.factory.newUser()
  const password = cuid()
  await changePassword(user, password)

  const params = {
    username: user.username,
    password: password + '.',
    persistent: false,
  }
  const res = await utils.getHttpClient()
    .call('/api/v5/LoginForm/authenticate', params)
  expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED)
});
