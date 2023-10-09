import { RecordDtoFragmentDoc, UpdateRecordCategoryIdInput, UpdateRecordCategoryIdResult } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test(`set category`, async () => {
  const user = await utils.factory.newUser()
  const {record} = await utils.factory.newRecord({ user })
  const category = await utils.factory.newCategory({ user })
  const input: UpdateRecordCategoryIdInput = {
    recordId: record.id.toString(),
    categoryId: category.id.toString(),
  }
  const { data, errors } = await utils.getHttpClientForUser(user).query<{updateRecordCategoryId: UpdateRecordCategoryIdResult}, any>(gql`
    mutation($input: UpdateRecordCategoryIdInput!) {
      updateRecordCategoryId(input: $input) {
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
  expect(data.updateRecordCategoryId.record.category!.id).toBe(input.categoryId)
})

test(`unset category`, async () => {
  const user = await utils.factory.newUser()
  const category = await utils.factory.newCategory({ user })
  const {record} = await utils.factory.newRecord({ user, category })
  const input: UpdateRecordCategoryIdInput = {
    recordId: record.id.toString(),
    categoryId: null,
  }
  const { data, errors } = await utils.getHttpClientForUser(user).query<{updateRecordCategoryId: UpdateRecordCategoryIdResult}, any>(gql`
    mutation($input: UpdateRecordCategoryIdInput!) {
      updateRecordCategoryId(input: $input) {
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
  expect(data.updateRecordCategoryId.record.category).toBe(null)
})
