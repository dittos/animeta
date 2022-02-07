import { PostDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('RecordPostsController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`get`, async () => {
    const { record, history } = await utils.factory.newRecord({ comment: 'hello' })
    const res = await utils.getHttpClient().get(`/api/v4/records/${record.id}/posts`)
    expect(res.status).toBe(200)
    const body = res.body as { posts: PostDTO[] }
    expect(body.posts.length).toBe(1)
    expect(body.posts[0].id).toBe(history.id)
  });
});
