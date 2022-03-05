import { getTestUtils, TestUtils } from './utils';

describe('DeleteRecordController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`delete record`, async () => {
    const user = await utils.factory.newUser()
    const {record} = await utils.factory.newRecord({ user })
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/DeleteRecord')
      .send({ id: record.id })
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  });
});
