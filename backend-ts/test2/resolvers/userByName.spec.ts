import { UserDtoFragment, UserDtoFragmentDoc } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('get non-existent user', async () => {
  const { data } = await utils.getHttpClient().query<{user: UserDtoFragment}, any>(gql`
    query($name: String!) {
      user: userByName(name: $name) {
        ...UserDTO
      }
    }
    ${UserDtoFragmentDoc}
  `, {
    variables: {
      name: 'nobody',
    }
  })
  expect(data.user).toBeNull()
})

test('get', async () => {
  const user = await utils.factory.newUser()
  const { data } = await utils.getHttpClient().query<{user: UserDtoFragment}, any>(gql`
    query($name: String!) {
      user: userByName(name: $name) {
        ...UserDTO
      }
    }
    ${UserDtoFragmentDoc}
  `, {
    variables: {
      name: user.username,
    }
  })
  expect(data.user.id).toBe(user.id.toString())
})
