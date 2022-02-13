import { WorkDTO } from 'shared/types_generated';
import { Period } from 'src/utils/period';
import { getTestUtils, TestUtils } from './utils';

describe('TablePeriodController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  beforeEach(() => utils.factory.deleteAllWorks())

  it(`get`, async () => {
    const period = new Period(2021, 1)
    const work = await utils.factory.newWork({ periods: [period] })
    const res = await utils.getHttpClient().get(`/api/v4/table/periods/${period}`)
    expect(res.status).toBe(200)
    const body = res.body as WorkDTO[]
    expect(body.length).toBe(1)
    expect(body[0].id).toBe(work.id)
    expect(body[0].record).toBeFalsy()
  });
  
  it(`get with record`, async () => {
    const period = new Period(2021, 1)
    const work = await utils.factory.newWork({ periods: [period] })
    const user = await utils.factory.newUser()
    const {record} = await utils.factory.newRecord({ user, work })
    const res = await utils.getHttpClientForUser(user).get(`/api/v4/table/periods/${period}`)
    expect(res.status).toBe(200)
    const body = res.body as WorkDTO[]
    expect(body.length).toBe(1)
    expect(body[0].id).toBe(work.id)
    expect(body[0].record?.id).toBe(record.id)
  });
  
  it(`get with recommendation`, async () => {
    const period = new Period(2021, 1)
    const work = await utils.factory.newWork({ periods: [period] })
    const user = await utils.factory.newUser()
    const {record} = await utils.factory.newRecord({ user, work })
    const res = await utils.getHttpClientForUser(user).get(`/api/v4/table/periods/${period}?with_recommendations=true`)
    expect(res.status).toBe(200)
    const body = res.body as WorkDTO[]
    expect(body.length).toBe(1)
    expect(body[0].id).toBe(work.id)
    expect(body[0].record?.id).toBe(record.id)
    expect(body[0].recommendations).toBeTruthy()
    expect(body[0].recommendationScore).not.toBeNull()
  });
});
