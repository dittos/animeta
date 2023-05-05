import { CategoryDtoFragmentDoc, DeleteCategoryInput, DeleteCategoryResult } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test(`delete category`, async () => {
  const user = await utils.factory.newUser()
  const category = await utils.factory.newCategory({ user })
  await utils.factory.newRecord({ user, category })

  const input: DeleteCategoryInput = {categoryId: category.id.toString()}
  const { data, errors } = await utils.getHttpClientForUser(user).query<{deleteCategory: DeleteCategoryResult}, any>(gql`
    mutation($input: DeleteCategoryInput!) {
      deleteCategory(input: $input) {
        deleted
        user {
          categories {
            ...CategoryDTO
          }
        }
      }
    }
    ${CategoryDtoFragmentDoc}
  `, {
    variables: {
      input
    }
  })
  expect(errors).toBeFalsy()
  expect(data.deleteCategory.deleted).toBeTruthy()
  expect(data.deleteCategory.user?.categories).toEqual([])

  // TODO: test record category being unset
})
