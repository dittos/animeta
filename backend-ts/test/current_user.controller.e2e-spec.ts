import { getTestUtils, TestUtils } from './utils';

describe('CurrentUserController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`get without session`, () => {
    return utils.getHttpClient()
      .get('/api/v4/me')
      .expect(403);
  });

  it(`get user`, async () => {
    const user = await utils.newUser();
    const client = utils.getHttpClientForUser(user);
    client.get(`/api/v4/me`)
      .expect(200);
  });
});
