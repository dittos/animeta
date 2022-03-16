import * as cuid from 'cuid';
import { CategoryDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';

describe('UpdateCategoryController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`update category name`, async () => {
    const user = await utils.factory.newUser()
    const category = await utils.factory.newCategory({ user })
    const params = {id: category.id, name: cuid()}
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/UpdateCategory')
      .send(params)
    expect(res.status).toBe(200)
    const updated = res.body.category as CategoryDTO
    expect(updated.name).toBe(params.name)
  });
});
