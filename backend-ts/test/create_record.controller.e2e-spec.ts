import { PostDTO, RecordDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('CreateRecordController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`create record`, async () => {
    const user = await utils.factory.newUser()
    const work = await utils.factory.newWork()
    const params = {
      title: work.title,
      categoryId: null,
      status: '2',
      statusType: 'WATCHING',
      comment: '2',
      publishTwitter: false,
      rating: null,
      options: {},
      postOptions: {},
    }
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/CreateRecord')
      .send(params)
    expect(res.status).toBe(201)
    const record = res.body.record as RecordDTO
    const post = res.body.post as PostDTO
    expect(record).toMatchObject<Partial<RecordDTO>>({
      user_id: user.id,
      work_id: work.id,
      category_id: null,
      title: work.title,
      status: params.status,
      status_type: params.statusType.toLowerCase(),
      rating: null,
    })
    expect(post).toMatchObject<Partial<PostDTO>>({
      record_id: record.id,
      status: params.status,
      status_type: params.statusType.toLowerCase(),
      comment: params.comment,
      updated_at: record.updated_at,
      contains_spoiler: false,
    })
  });
  
  it(`create record with category`, async () => {
    const user = await utils.factory.newUser()
    const category = await utils.factory.newCategory({ user })
    const work = await utils.factory.newWork()
    const params = {
      title: work.title,
      categoryId: category.id,
      status: '2',
      statusType: 'WATCHING',
      comment: '2',
      publishTwitter: false,
      rating: null,
      options: {},
      postOptions: null,
    }
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/CreateRecord')
      .send(params)
    expect(res.status).toBe(201)
    const record = res.body.record as RecordDTO
    expect(record).toMatchObject<Partial<RecordDTO>>({
      user_id: user.id,
      work_id: work.id,
      category_id: category.id,
      title: work.title,
      status: params.status,
      status_type: params.statusType.toLowerCase(),
      rating: null,
    })
  });
});
