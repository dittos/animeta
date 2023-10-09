import * as cuid from 'cuid'
import { CategoryDtoFragment, CategoryDtoFragmentDoc, RenameCategoryInput, RenameCategoryResult } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test(`rename category`, async () => {
  const user = await utils.factory.newUser()
  const category = await utils.factory.newCategory({ user })
  const input: RenameCategoryInput = {categoryId: category.id.toString(), name: cuid()}
  const { data, errors } = await utils.getHttpClientForUser(user).query<{renameCategory: RenameCategoryResult}, any>(gql`
    mutation($input: RenameCategoryInput!) {
      renameCategory(input: $input) {
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
  expect(data.renameCategory.category).toMatchObject<Partial<CategoryDtoFragment>>({
    id: input.categoryId,
    name: input.name,
  })
})
