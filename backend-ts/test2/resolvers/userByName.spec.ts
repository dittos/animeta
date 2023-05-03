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
  await utils.factory.newRecord({ user })
  const { data } = await utils.getHttpClient().query<{user: UserDtoFragment & {recordCount: number; postCount: number}}, any>(gql`
    query($name: String!) {
      user: userByName(name: $name) {
        ...UserDTO
        recordCount
        postCount
      }
    }
    ${UserDtoFragmentDoc}
  `, {
    variables: {
      name: user.username,
    }
  })
  expect(data.user.id).toBe(user.id.toString())
  expect(data.user.name).toBe(user.username)
  expect(new Date(data.user.joinedAt)).toEqual(user.date_joined)
  expect(data.user.recordCount).toBe(1)
  expect(data.user.postCount).toBe(1)
})
