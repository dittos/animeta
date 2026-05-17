import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('categories', async () => {
  const user = await utils.factory.newUser()
  const category1 = await utils.factory.newCategory({ user })
  const category2 = await utils.factory.newCategory({ user })
  const { data } = await utils.getHttpClient().query<{user: {categories: {id: string, name: string}[]}}, any>(gql`
    query($name: String!) {
      user: userByName(name: $name) {
        categories {
          id
          name
        }
      }
    }
  `, {
    variables: {
      name: user.username,
    }
  })

  expect(data.user.categories).toEqual([
    {id: category1.id.toString(), name: category1.name},
    {id: category2.id.toString(), name: category2.name},
  ])
})
