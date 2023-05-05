import { CategoryDtoFragmentDoc, UpdateCategoryOrderInput, UpdateCategoryOrderResult } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test(`update category order`, async () => {
  const user = await utils.factory.newUser()
  const category1 = await utils.factory.newCategory({ user })
  const category2 = await utils.factory.newCategory({ user })
  const category3 = await utils.factory.newCategory({ user })
  const category4 = await utils.factory.newCategory({ user })
  const input: UpdateCategoryOrderInput = {
    categoryIds: [category2, category3, category4, category1].map(it => it.id.toString())
  }
  
  const { data, errors } = await utils.getHttpClientForUser(user).query<{updateCategoryOrder: UpdateCategoryOrderResult}, any>(gql`
    mutation($input: UpdateCategoryOrderInput!) {
      updateCategoryOrder(input: $input) {
        categories { ...CategoryDTO }
      }
    }
    ${CategoryDtoFragmentDoc}
  `, {
    variables: {
      input
    }
  })
  expect(errors).toBeFalsy()
  const categories = data.updateCategoryOrder.categories
  expect(categories.map(it => it.id)).toEqual(input.categoryIds)

  {
    const { data } = await utils.getHttpClientForUser(user).query(gql`
      query {
        currentUser {
          categories { ...CategoryDTO }
        }
      }
      ${CategoryDtoFragmentDoc}
    `)
    expect(data.currentUser.categories).toEqual(categories)
  }
})
