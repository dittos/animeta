import { UserDtoFragment, UserDtoFragmentDoc } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('get without session', async () => {
  const { data } = await utils.getHttpClient().query<{currentUser: UserDtoFragment}>(gql`
    query {
      currentUser {
        ...UserDTO
      }
    }
    ${UserDtoFragmentDoc}
  `)
  expect(data.currentUser).toBeNull()
})

test('get', async () => {
  const user = await utils.factory.newUser()
  const { data } = await utils.getHttpClientForUser(user).query<{currentUser: UserDtoFragment}>(gql`
    query {
      currentUser {
        ...UserDTO
      }
    }
    ${UserDtoFragmentDoc}
  `)
  expect(data.currentUser.id).toBe(user.id.toString())
})
