import { HttpStatus } from '@nestjs/common';
import { RecordDTO } from 'shared/types_generated';
import { StatusType } from 'src/entities/status_type';
import { getTestUtils, TestUtils } from './utils';

describe('DeletePostController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`deleting last post fails`, async () => {
    const user = await utils.factory.newUser()
    const {history} = await utils.factory.newRecord({ user })
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/DeletePost')
      .send({ id: history.id })
    expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY)
  });

  it(`deleting post succeed and record gets updated`, async () => {
    const user = await utils.factory.newUser()
    const {record, history} = await utils.factory.newRecord({ user })
    const historyToDelete = await utils.factory.newHistory({ record })
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/DeletePost')
      .send({ id: historyToDelete.id, recordOptions: {} })
    const updatedRecord = res.body.record as RecordDTO
    expect(res.status).toBe(200)
    expect(updatedRecord.status).toBe(history.status)
    expect(updatedRecord.status_type).toBe(StatusType[history.status_type].toLowerCase())
    expect(updatedRecord.updated_at).toBe(historyToDelete.updated_at?.getTime())
  });
});
