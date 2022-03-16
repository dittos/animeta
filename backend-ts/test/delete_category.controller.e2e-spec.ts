import { getTestUtils, TestUtils } from './utils';

describe('DeleteCategoryController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`delete category`, async () => {
    const user = await utils.factory.newUser()
    const category = await utils.factory.newCategory({ user })
    await utils.factory.newRecord({ user, category })
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/DeleteCategory')
      .send({id: category.id})
    expect(res.status).toBe(200)
    {
      const res = await utils.getHttpClientForUser(user)
        .get('/api/v4/me?options={"categories":true}')
      expect(res.body.categories).toEqual([])
    }
  });
});
