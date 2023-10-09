import { StatusType } from 'src/entities/status_type'
import { DeletePostInput, DeletePostResult, RecordDtoFragmentDoc } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test(`deleting last post fails`, async () => {
  const user = await utils.factory.newUser()
  const {history} = await utils.factory.newRecord({ user })

  const input: DeletePostInput = {postId: history.id.toString()}
  const { errors } = await utils.getHttpClientForUser(user).rawQuery<{deletePost: DeletePostResult}, any>(gql`
    mutation($input: DeletePostInput!) {
      deletePost(input: $input) {
        deleted
      }
    }
  `, {
    variables: {
      input
    }
  })
  expect(errors).toBeTruthy()
})

test(`deleting post succeed and record gets updated`, async () => {
  const user = await utils.factory.newUser()
  const {record, history} = await utils.factory.newRecord({ user })
  const historyToDelete = await utils.factory.newHistory({ record })

  const input: DeletePostInput = {postId: historyToDelete.id.toString()}
  const { data, errors } = await utils.getHttpClientForUser(user).query<{deletePost: DeletePostResult}, any>(gql`
    mutation($input: DeletePostInput!) {
      deletePost(input: $input) {
        deleted
        record { ...RecordDTO }
      }
    }
    ${RecordDtoFragmentDoc}
  `, {
    variables: {
      input
    }
  })
  expect(errors).toBeFalsy()
  expect(data.deletePost.record?.status).toBe(history.status)
  expect(data.deletePost.record?.statusType).toBe(StatusType[history.status_type])
  expect(data.deletePost.record?.updatedAt).toBe(historyToDelete.updated_at?.toJSON())
})
