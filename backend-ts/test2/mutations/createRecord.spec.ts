import { CreateRecordInput, CreateRecordResult, PostDtoFragment, PostDtoFragmentDoc, RecordDtoFragment, RecordDtoFragmentDoc, StatusType } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('create record', async () => {
  const user = await utils.factory.newUser()
  const work = await utils.factory.newWork()
  const input: CreateRecordInput = {
    title: work.title,
    categoryId: null,
    status: '2',
    statusType: StatusType.Watching,
    comment: '2',
    publishTwitter: false,
    rating: null,
  }
  const { data, errors } = await utils.getHttpClientForUser(user).query<{createRecord: CreateRecordResult}, any>(gql`
    mutation($input: CreateRecordInput!) {
      createRecord(input: $input) {
        record { ...RecordDTO }
        post { ...PostDTO }
      }
    }
    ${RecordDtoFragmentDoc}
    ${PostDtoFragmentDoc}
  `, {
    variables: {
      input
    }
  })
  expect(errors).toBeFalsy()

  const record = data.createRecord.record as RecordDtoFragment
  const post = data.createRecord.post as PostDtoFragment
  expect(record).toMatchObject<Partial<RecordDtoFragment>>({
    user: {id: user.id.toString()},
    work: {id: work.id.toString()},
    category: null,
    title: work.title,
    status: input.status,
    statusType: input.statusType,
    rating: null,
  })
  expect(post).toMatchObject<Partial<PostDtoFragment>>({
    record: {id: record.id},
    status: input.status,
    statusType: input.statusType,
    comment: input.comment,
    updatedAt: record.updatedAt,
    containsSpoiler: false,
  })
})

test('create record with category', async () => {
  const user = await utils.factory.newUser()
  const category = await utils.factory.newCategory({ user })
  const work = await utils.factory.newWork()
  const input: CreateRecordInput = {
    title: work.title,
    categoryId: category.id.toString(),
    status: '2',
    statusType: StatusType.Watching,
    comment: '2',
    publishTwitter: false,
    rating: null,
  }
  const { data, errors } = await utils.getHttpClientForUser(user).query<{createRecord: CreateRecordResult}, any>(gql`
    mutation($input: CreateRecordInput!) {
      createRecord(input: $input) {
        record { ...RecordDTO }
        post { ...PostDTO }
      }
    }
    ${RecordDtoFragmentDoc}
    ${PostDtoFragmentDoc}
  `, {
    variables: {
      input
    }
  })
  expect(errors).toBeFalsy()

  const record = data.createRecord.record as RecordDtoFragment
  expect(record).toMatchObject<Partial<RecordDtoFragment>>({
    user: {id: user.id.toString()},
    work: {id: work.id.toString()},
    category: {id: category.id.toString()},
    title: work.title,
    status: input.status,
    statusType: input.statusType,
    rating: null,
  })
})

test('create record with rating', async () => {
  const user = await utils.factory.newUser()
  const work = await utils.factory.newWork()
  const input: CreateRecordInput = {
    title: work.title,
    categoryId: null,
    status: '2',
    statusType: StatusType.Watching,
    comment: '2',
    publishTwitter: false,
    rating: 5,
  }
  const { data, errors } = await utils.getHttpClientForUser(user).query<{createRecord: CreateRecordResult}, any>(gql`
    mutation($input: CreateRecordInput!) {
      createRecord(input: $input) {
        record { ...RecordDTO }
        post { ...PostDTO }
      }
    }
    ${RecordDtoFragmentDoc}
    ${PostDtoFragmentDoc}
  `, {
    variables: {
      input
    }
  })
  expect(errors).toBeFalsy()

  const record = data.createRecord.record as RecordDtoFragment
  const post = data.createRecord.post as PostDtoFragment
  expect(record.rating).toEqual(input.rating)
  expect(post.rating).toBeNull() // post should not inherit record rating
})

test('create record with half star rating', async () => {
  const user = await utils.factory.newUser()
  const work = await utils.factory.newWork()
  const input: CreateRecordInput = {
    title: work.title,
    categoryId: null,
    status: '2',
    statusType: StatusType.Watching,
    comment: '2',
    publishTwitter: false,
    rating: 2.5,
  }
  const { data, errors } = await utils.getHttpClientForUser(user).query<{createRecord: CreateRecordResult}, any>(gql`
    mutation($input: CreateRecordInput!) {
      createRecord(input: $input) {
        record { ...RecordDTO }
        post { ...PostDTO }
      }
    }
    ${RecordDtoFragmentDoc}
    ${PostDtoFragmentDoc}
  `, {
    variables: {
      input
    }
  })
  expect(errors).toBeFalsy()

  const record = data.createRecord.record as RecordDtoFragment
  const post = data.createRecord.post as PostDtoFragment
  expect(record.rating).toEqual(input.rating)
  expect(post.rating).toBeNull() // post should not inherit record rating
})
