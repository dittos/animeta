import { PostDTO, RecordDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('CreatePostController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`create post`, async () => {
    const user = await utils.factory.newUser()
    const {record} = await utils.factory.newRecord({ user })
    const params = {
      recordId: record.id,
      status: '2',
      statusType: 'watching',
      comment: '2',
      containsSpoiler: false,
      publishTwitter: false,
      options: {record: {}},
    }
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/CreatePost')
      .send(params)
    expect(res.status).toBe(201)
    const post = res.body.post as PostDTO
    expect(post).toMatchObject<Partial<PostDTO>>({
      status: params.status,
      status_type: params.statusType,
      comment: params.comment,
      contains_spoiler: params.containsSpoiler,
    })
    expect(post.record).toMatchObject<Partial<RecordDTO>>({
      id: params.recordId,
      status: params.status,
      status_type: params.statusType,
      updated_at: post.updated_at,
    })
  });
});
