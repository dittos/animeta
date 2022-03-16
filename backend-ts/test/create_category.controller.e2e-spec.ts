import { CategoryDTO } from 'shared/types_generated';
import { getTestUtils, TestUtils } from './utils';
import * as cuid from 'cuid';

describe('CreateCategoryController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`create category`, async () => {
    const user = await utils.factory.newUser()
    const params = {name: cuid()}
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/CreateCategory')
      .send(params)
    expect(res.status).toBe(201)
    const category = res.body.category as CategoryDTO
    expect(category).toMatchObject<Partial<CategoryDTO>>({
      name: params.name,
    })
  });

  it(`create category when already has category`, async () => {
    const user = await utils.factory.newUser()
    await utils.factory.newCategory({ user })

    const params = {name: cuid()}
    const res = await utils.getHttpClientForUser(user)
      .post('/api/v4/CreateCategory')
      .send(params)
    expect(res.status).toBe(201)
    const category = res.body.category as CategoryDTO
    expect(category).toMatchObject<Partial<CategoryDTO>>({
      name: params.name,
    })
  });
});
