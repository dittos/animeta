import * as cuid from 'cuid'
import { CategoryDtoFragment, CategoryDtoFragmentDoc, CreateCategoryInput, CreateCategoryResult } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test(`create category`, async () => {
  const user = await utils.factory.newUser()
  const input: CreateCategoryInput = {name: cuid()}
  const { data, errors } = await utils.getHttpClientForUser(user).query<{createCategory: CreateCategoryResult}, any>(gql`
    mutation($input: CreateCategoryInput!) {
      createCategory(input: $input) {
        category { ...CategoryDTO }
      }
    }
    ${CategoryDtoFragmentDoc}
  `, {
    variables: {
      input
    }
  })
  expect(errors).toBeFalsy()
  expect(data.createCategory.category).toMatchObject<Partial<CategoryDtoFragment>>({
    name: input.name,
  })
})

test(`create category when already has category`, async () => {
  const user = await utils.factory.newUser()
  await utils.factory.newCategory({ user })
  
  const input: CreateCategoryInput = {name: cuid()}
  const { data, errors } = await utils.getHttpClientForUser(user).query<{createCategory: CreateCategoryResult}, any>(gql`
    mutation($input: CreateCategoryInput!) {
      createCategory(input: $input) {
        category { ...CategoryDTO }
      }
    }
    ${CategoryDtoFragmentDoc}
  `, {
    variables: {
      input
    }
  })
  expect(errors).toBeFalsy()
  expect(data.createCategory.category).toMatchObject<Partial<CategoryDtoFragment>>({
    name: input.name,
  })
})
