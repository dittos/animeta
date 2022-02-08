import { PostDTO } from 'shared/types_generated';
import { GetWorkPostsWithCountsResponse } from 'src/controllers/work_posts.controller';
import { getTestUtils, TestUtils } from './utils';

describe('WorkPostsController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`get`, async () => {
    const work = await utils.factory.newWork()
    const { history } = await utils.factory.newRecord({ work, comment: 'hello' })
    const res = await utils.getHttpClient().get(`/api/v4/works/${work.id}/posts`)
    expect(res.status).toBe(200)
    const body = res.body as PostDTO[]
    expect(body.length).toBe(1)
    expect(body[0].id).toBe(history.id)
  });
  
  it(`get with counts and episode`, async () => {
    const work = await utils.factory.newWork()
    const { history } = await utils.factory.newRecord({ work, comment: 'hello' })
    const res = await utils.getHttpClient().get(`/api/v4/works/${work.id}/posts?withCounts=true&episode=${encodeURIComponent(history.status)}`)
    expect(res.status).toBe(200)
    const body = res.body as GetWorkPostsWithCountsResponse
    expect(body.data.length).toBe(1)
    expect(body.data[0].id).toBe(history.id)
    expect(body.userCount).toBe(1)
    expect(body.suspendedUserCount).toBe(0)
  });
});
