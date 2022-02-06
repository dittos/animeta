import { getTestUtils, TestUtils } from './utils';

describe('UserController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`get non-existent user`, () => {
    return utils.getHttpClient()
      .get('/api/v4/users/nobody')
      .expect(404);
  });

  it(`get user`, async () => {
    const user = await utils.factory.newUser();
    return utils.getHttpClient()
      .get(`/api/v4/users/${user.username}`)
      .expect(200);
  });
});
