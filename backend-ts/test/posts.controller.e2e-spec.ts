import { PostDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('PostsController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  beforeEach(async () => await utils.factory.deleteAllRecords())

  it(`get`, async () => {
    const { history } = await utils.factory.newRecord({ comment: 'hello' })
    const res = await utils.getHttpClient().get('/api/v4/posts')
    expect(res.status).toBe(200)
    const posts = res.body as PostDTO[]
    expect(posts.length).toBe(1)
    expect(posts[0].id).toBe(history.id)
  });
  
  it(`get with min_record_count`, async () => {
    const { history } = await utils.factory.newRecord({ comment: 'hello' })
    // {
    //   const res = await utils.getHttpClient().get('/api/v4/posts?min_record_count=1')
    //   expect(res.status).toBe(200)
    //   const posts = res.body as PostDTO[]
    //   expect(posts.length).toBe(1)
    //   expect(posts[0].id).toBe(history.id)
    // }
    {
      const res = await utils.getHttpClient().get('/api/v4/posts?min_record_count=2')
      expect(res.status).toBe(200)
      const posts = res.body as PostDTO[]
      // should be empty because no work has record count >= 2
      expect(posts.length).toBe(0)
    }
  });
});
