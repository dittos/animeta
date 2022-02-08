import { WorkDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('WorkByTitleController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`get`, async () => {
    const work = await utils.factory.newWork()
    const res = await utils.getHttpClient().get(`/api/v4/works/by-title?title=${encodeURIComponent(work.title)}`)
    expect(res.status).toBe(200)
    const body = res.body as WorkDTO
    expect(body.id).toBe(work.id)
  });
});
