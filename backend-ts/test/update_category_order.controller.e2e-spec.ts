import { CategoryDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('UpdateCategoryOrderController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`update category order`, async () => {
    const user = await utils.factory.newUser()
    const category1 = await utils.factory.newCategory({ user })
    const category2 = await utils.factory.newCategory({ user })
    const category3 = await utils.factory.newCategory({ user })
    const category4 = await utils.factory.newCategory({ user })
    const params = {categoryIds: [category2.id, category3.id, category4.id, category1.id]}
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/UpdateCategoryOrder')
      .send(params)
    expect(res.status).toBe(200)
    const categories = res.body.categories as CategoryDTO[]
    expect(categories.map(it => it.id)).toEqual(params.categoryIds)
    {
      const res = await utils.getHttpClientForUser(user)
        .get('/api/v4/me?options={"categories":true}')
      expect(res.body.categories).toEqual(categories)
    }
  });
});
