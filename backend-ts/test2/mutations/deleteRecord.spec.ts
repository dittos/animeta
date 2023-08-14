import { DeleteRecordInput, DeleteRecordResult } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test(`delete record`, async () => {
  const user = await utils.factory.newUser()
  const {record} = await utils.factory.newRecord({ user })

  const input: DeleteRecordInput = {recordId: record.id.toString()}
  const { data, errors } = await utils.getHttpClientForUser(user).query<{deleteRecord: DeleteRecordResult}, any>(gql`
    mutation($input: DeleteRecordInput!) {
      deleteRecord(input: $input) {
        deleted
        user {
          recordCount
          postCount
        }
      }
    }
  `, {
    variables: {
      input
    }
  })
  expect(errors).toBeFalsy()
  expect(data.deleteRecord.deleted).toBeTruthy()
  expect(data.deleteRecord.user?.recordCount).toEqual(0)
  expect(data.deleteRecord.user?.postCount).toEqual(0)
})
