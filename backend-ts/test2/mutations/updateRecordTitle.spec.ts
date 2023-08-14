import { RecordDtoFragment, RecordDtoFragmentDoc, UpdateRecordTitleInput, UpdateRecordTitleResult } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test(`update record title`, async () => {
  const user = await utils.factory.newUser()
  const {record} = await utils.factory.newRecord({ user })
  const input: UpdateRecordTitleInput = {
    recordId: record.id.toString(),
    title: record.title + '-new',
  }
  const { data, errors } = await utils.getHttpClientForUser(user).query<{updateRecordTitle: UpdateRecordTitleResult}, any>(gql`
    mutation($input: UpdateRecordTitleInput!) {
      updateRecordTitle(input: $input) {
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
  expect(data.updateRecordTitle.record).toMatchObject<Partial<RecordDtoFragment>>({
    id: input.recordId,
    title: input.title,
  })
  expect(data.updateRecordTitle.record.work!.id).not.toBe(record.work_id)
})
