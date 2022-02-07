import { PostDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('UserPostsController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`get`, async () => {
    const user = await utils.factory.newUser()
    const { record, history } = await utils.factory.newRecord({ user })
    const res = await utils.getHttpClient().get(`/api/v4/users/${user.username}/posts`)
    expect(res.status).toBe(200)
    const body = res.body as PostDTO[]
    expect(body.length).toBe(1)
    expect(body[0].id).toBe(history.id)
  });
});
