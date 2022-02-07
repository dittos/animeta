import { RecordDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('RecordController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`get non-existent record`, () => {
    return utils.getHttpClient()
      .get('/api/v4/records/0')
      .expect(404);
  });

  it(`get record`, async () => {
    const { record } = await utils.factory.newRecord();
    const res = await utils.getHttpClient().get(`/api/v4/records/${record.id}`)
    expect(res.status).toBe(200)
    const r = res.body as RecordDTO
    expect(r.id).toBe(record.id)
  });
});
