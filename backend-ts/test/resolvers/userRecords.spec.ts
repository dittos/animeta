import { User } from 'src/entities/user.entity'
import { StatusType as GqlStatusType, RecordDtoFragment, RecordDtoFragmentDoc } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'
import { StatusType } from 'src/entities/status_type'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

async function getRecords(user: User, variables: {
  statusType?: GqlStatusType,
  categoryId?: string,
} = {}): Promise<RecordDtoFragment[]> {
  const { data } = await utils.getHttpClient().query<{user: {records: {nodes: RecordDtoFragment[]}}}, any>(gql`
    query($name: String!, $statusType: StatusType, $categoryId: ID) {
      user: userByName(name: $name) {
        records(statusType: $statusType, categoryId: $categoryId) {
          nodes {
            ...RecordDTO
          }
        }
      }
    }
    ${RecordDtoFragmentDoc}
  `, {
    variables: {
      name: user.username,
      ...variables,
    }
  })
  return data.user.records.nodes
}

test('empty records', async () => {
  const user = await utils.factory.newUser()

  const records = await getRecords(user)
  expect(records).toEqual([])
})

test('get without filter', async () => {
  const user = await utils.factory.newUser()
  const {record} = await utils.factory.newRecord({ user })

  const records = await getRecords(user)
  expect(records.length).toEqual(1)
  expect(records[0].id).toEqual(record.id.toString())
})

test('get by status type', async () => {
  const user = await utils.factory.newUser()
  const {record} = await utils.factory.newRecord({ user, statusType: StatusType.WATCHING })
  await utils.factory.newRecord({ user, statusType: StatusType.FINISHED })

  const records = await getRecords(user, {statusType: GqlStatusType.Watching})
  expect(records.length).toEqual(1)
  expect(records[0].id).toEqual(record.id.toString())
})

test('get by category', async () => {
  const user = await utils.factory.newUser()
  const category1 = await utils.factory.newCategory({ user })
  const category2 = await utils.factory.newCategory({ user })
  await utils.factory.newRecord({ user })
  const {record} = await utils.factory.newRecord({ user, category: category1 })
  await utils.factory.newRecord({ user, category: category2 })

  const records = await getRecords(user, {categoryId: category1.id.toString()})
  expect(records.length).toEqual(1)
  expect(records[0].id).toEqual(record.id.toString())
})

test('get by status type and category', async () => {
  const user = await utils.factory.newUser()
  await utils.factory.newRecord({ user })
  const category = await utils.factory.newCategory({ user })
  const {record} = await utils.factory.newRecord({ user, statusType: StatusType.WATCHING, category })
  await utils.factory.newRecord({ user, statusType: StatusType.FINISHED, category })
  await utils.factory.newRecord({ user, statusType: StatusType.WATCHING })

  const records = await getRecords(user, {statusType: GqlStatusType.Watching, categoryId: category.id.toString()})
  expect(records.length).toEqual(1)
  expect(records[0].id).toEqual(record.id.toString())
})

test('category id filter 0 is interpreted as records with no category', async () => {
  const user = await utils.factory.newUser()
  const {record} = await utils.factory.newRecord({ user })
  const category = await utils.factory.newCategory({ user })
  await utils.factory.newRecord({ user, category, statusType: StatusType.WATCHING })

  const records = await getRecords(user, {categoryId: '0'})
  expect(records.length).toEqual(1)
  expect(records[0].id).toEqual(record.id.toString())
})
