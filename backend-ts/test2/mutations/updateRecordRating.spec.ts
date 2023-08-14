import { RecordDtoFragmentDoc, UpdateRecordRatingInput, UpdateRecordRatingResult } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test(`set rating`, async () => {
  const user = await utils.factory.newUser()
  const {record} = await utils.factory.newRecord({ user })
  const input: UpdateRecordRatingInput = {
    recordId: record.id.toString(),
    rating: 2.5,
  }
  const { data, errors } = await utils.getHttpClientForUser(user).query<{updateRecordRating: UpdateRecordRatingResult}, any>(gql`
    mutation($input: UpdateRecordRatingInput!) {
      updateRecordRating(input: $input) {
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
  expect(data.updateRecordRating.record.rating).toBe(input.rating)
})

test(`unset rating`, async () => {
  const user = await utils.factory.newUser()
  const {record} = await utils.factory.newRecord({ user })
  const input: UpdateRecordRatingInput = {
    recordId: record.id.toString(),
    rating: null,
  }
  const { data, errors } = await utils.getHttpClientForUser(user).query<{updateRecordRating: UpdateRecordRatingResult}, any>(gql`
    mutation($input: UpdateRecordRatingInput!) {
      updateRecordRating(input: $input) {
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
  expect(data.updateRecordRating.record.rating).toBe(null)
})
