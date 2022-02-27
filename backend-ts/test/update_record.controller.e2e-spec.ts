import { RecordDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('UpdateRecordController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`update title`, async () => {
    const user = await utils.factory.newUser()
    const {record} = await utils.factory.newRecord({ user })
    const params = {
      id: record.id,
      title: record.title + '-new',
      options: {},
    }
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/UpdateRecord')
      .send(params)
    expect(res.status).toBe(200)
    const updatedRecord = res.body.record as RecordDTO
    expect(updatedRecord.title).toBe(params.title)
    expect(updatedRecord.work_id).not.toBe(record.work_id)
  });

  it(`set category`, async () => {
    const user = await utils.factory.newUser()
    const {record} = await utils.factory.newRecord({ user })
    const category = await utils.factory.newCategory({ user })
    const params = {
      id: record.id,
      categoryId: category.id,
      categoryIdIsSet: true,
      options: {},
    }
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/UpdateRecord')
      .send(params)
    expect(res.status).toBe(200)
    const updatedRecord = res.body.record as RecordDTO
    expect(updatedRecord.category_id).toBe(params.categoryId)
  });

  it(`unset category`, async () => {
    const user = await utils.factory.newUser()
    const category = await utils.factory.newCategory({ user })
    const {record} = await utils.factory.newRecord({ user, category })
    const params = {
      id: record.id,
      categoryId: null,
      categoryIdIsSet: true,
      options: {},
    }
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/UpdateRecord')
      .send(params)
    expect(res.status).toBe(200)
    const updatedRecord = res.body.record as RecordDTO
    expect(updatedRecord.category_id).toBe(null)
  });
});
