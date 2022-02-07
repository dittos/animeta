import { RecordDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('UserRecordsController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`get`, async () => {
    const user = await utils.factory.newUser()
    const { record } = await utils.factory.newRecord({ user })
    const res = await utils.getHttpClient().get(`/api/v4/users/${user.username}/records`)
    expect(res.status).toBe(200)
    const body = res.body as RecordDTO[]
    expect(body.length).toBe(1)
    expect(body[0].id).toBe(record.id)
  });

  it(`get with counts`, async () => {
    const user = await utils.factory.newUser()
    const { record } = await utils.factory.newRecord({ user })
    const res = await utils.getHttpClient().get(`/api/v4/users/${user.username}/records?with_counts=true`)
    expect(res.status).toBe(200)
    const body = res.body as { data: RecordDTO[] }
    expect(body.data.length).toBe(1)
    expect(body.data[0].id).toBe(record.id)
  });
});
