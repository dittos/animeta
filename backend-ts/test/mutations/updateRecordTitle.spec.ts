import { addTitleMapping } from 'src/services/work'
import { RecordDtoFragment, RecordDtoFragmentDoc, UpdateRecordTitleInput, UpdateRecordTitleResult } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'
import * as cuid from 'cuid'

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
  expect(data.updateRecordTitle.record.work!.id).not.toBe(record.work_id.toString())
})

test(`update record title to the same one`, async () => {
  const user = await utils.factory.newUser()
  const {record} = await utils.factory.newRecord({ user })
  const input: UpdateRecordTitleInput = {
    recordId: record.id.toString(),
    title: record.title,
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
  expect(data.updateRecordTitle.record.work!.id).toBe(record.work_id.toString())
})

test(`update record title to the different alias of the same work`, async () => {
  const user = await utils.factory.newUser()
  const work = await utils.factory.newWork()
  const {record} = await utils.factory.newRecord({ user, work })
  const aliasTitle = cuid()
  await addTitleMapping(work, aliasTitle)

  const input: UpdateRecordTitleInput = {
    recordId: record.id.toString(),
    title: aliasTitle,
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
  expect(data.updateRecordTitle.record.work!.id).toBe(record.work_id.toString())
})

test(`update record title to the already added work should fail`, async () => {
  const user = await utils.factory.newUser()
  const {record: existingRecord} = await utils.factory.newRecord({ user })
  const {record} = await utils.factory.newRecord({ user })

  const input: UpdateRecordTitleInput = {
    recordId: record.id.toString(),
    title: existingRecord.title,
  }
  const { errors } = await utils.getHttpClientForUser(user).rawQuery<{}, any>(gql`
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
  expect(errors).toBeTruthy()
})
