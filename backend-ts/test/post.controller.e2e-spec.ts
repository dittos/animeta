import { PostDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('PostController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`get non-existent post`, () => {
    return utils.getHttpClient()
      .get('/api/v4/posts/0')
      .expect(404);
  });

  it(`get post`, async () => {
    const { history } = await utils.factory.newRecord();
    const res = await utils.getHttpClient().get(`/api/v4/posts/${history.id}`)
    expect(res.status).toBe(200)
    const post = res.body as PostDTO
    expect(post.id).toBe(history.id)
  });
});
