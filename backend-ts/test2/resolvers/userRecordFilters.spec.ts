import { User } from 'src/entities/user.entity'
import { RecordFilters, StatusType as GqlStatusType } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'
import { StatusType } from 'src/entities/status_type'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

async function getRecordFilters(user: User, variables: {
  statusType?: GqlStatusType,
  categoryId?: string,
} = {}): Promise<RecordFilters> {
  const { data } = await utils.getHttpClient().query<{user: {recordFilters: RecordFilters}}, any>(gql`
    query($name: String!, $statusType: StatusType, $categoryId: ID) {
      user: userByName(name: $name) {
        recordFilters(statusType: $statusType, categoryId: $categoryId) {
          statusType {
            ...RF
          }
          categoryId {
            ...RF
          }
        }
      }
    }
    fragment RF on RecordFilter {
      allCount
      items {
        key, count
      }
    }
  `, {
    variables: {
      name: user.username,
      ...variables,
    }
  })
  return data.user.recordFilters
}

test('empty records', async () => {
  const user = await utils.factory.newUser()

  const filters = await getRecordFilters(user)
  expect(filters.statusType).toEqual({
    allCount: 0,
    items: [],
  })
  expect(filters.categoryId).toEqual({
    allCount: 0,
    items: [],
  })
})

test('counts by status type without filter', async () => {
  const user = await utils.factory.newUser()
  for (const statusType of [StatusType.WATCHING, StatusType.FINISHED, StatusType.SUSPENDED, StatusType.INTERESTED]) {
    await utils.factory.newRecord({ user, statusType })
  }

  const filters = await getRecordFilters(user)
  expect(filters.statusType.allCount).toEqual(4)
  expect(filters.statusType.items.length).toEqual(4)
  for (const expected of [
    {key: 'WATCHING', count: 1},
    {key: 'FINISHED', count: 1},
    {key: 'SUSPENDED', count: 1},
    {key: 'INTERESTED', count: 1},
  ]) {
    expect(filters.statusType.items.find(it => it.key === expected.key)).toEqual(expected)
  }
})

test('counts by status type with status type filter should not change', async () => {
  const user = await utils.factory.newUser()
  for (const statusType of [StatusType.WATCHING, StatusType.FINISHED, StatusType.SUSPENDED, StatusType.INTERESTED]) {
    await utils.factory.newRecord({ user, statusType })
  }

  const filters = await getRecordFilters(user, {statusType: GqlStatusType.Watching})
  expect(filters.statusType.allCount).toEqual(4)
  expect(filters.statusType.items.length).toEqual(4)
  for (const expected of [
    {key: 'WATCHING', count: 1},
    {key: 'FINISHED', count: 1},
    {key: 'SUSPENDED', count: 1},
    {key: 'INTERESTED', count: 1},
  ]) {
    expect(filters.statusType.items.find(it => it.key === expected.key)).toEqual(expected)
  }
})

test('counts by status type with category filter should be filtered', async () => {
  const user = await utils.factory.newUser()
  for (const statusType of [StatusType.WATCHING, StatusType.FINISHED, StatusType.SUSPENDED, StatusType.INTERESTED]) {
    await utils.factory.newRecord({ user, statusType })
  }
  const category = await utils.factory.newCategory({ user })
  await utils.factory.newRecord({ user, category, statusType: StatusType.WATCHING })

  const filters = await getRecordFilters(user, {categoryId: category.id.toString()})
  expect(filters.statusType).toEqual({
    allCount: 1,
    items: [
      {key: 'WATCHING', count: 1},
    ],
  })
})

test('counts by status type with category and status type filter should be filtered only by category', async () => {
  const user = await utils.factory.newUser()
  for (const statusType of [StatusType.WATCHING, StatusType.FINISHED, StatusType.SUSPENDED, StatusType.INTERESTED]) {
    await utils.factory.newRecord({ user, statusType })
  }
  const category = await utils.factory.newCategory({ user })
  await utils.factory.newRecord({ user, category, statusType: StatusType.WATCHING })

  const filters = await getRecordFilters(user, {categoryId: category.id.toString(), statusType: GqlStatusType.Suspended})
  expect(filters.statusType).toEqual({
    allCount: 1,
    items: [
      {key: 'WATCHING', count: 1},
    ],
  })
})

test('counts by category without filter', async () => {
  const user = await utils.factory.newUser()
  await utils.factory.newRecord({ user, category: undefined })
  const category = await utils.factory.newCategory({ user })
  await utils.factory.newRecord({ user, category })

  const filters = await getRecordFilters(user)
  expect(filters.categoryId).toEqual({
    allCount: 2,
    items: [
      {key: '0', count: 1},
      {key: category.id.toString(), count: 1},
    ],
  })
})

test('counts by category with category filter should not change', async () => {
  const user = await utils.factory.newUser()
  await utils.factory.newRecord({ user, category: undefined })
  const category = await utils.factory.newCategory({ user })
  await utils.factory.newRecord({ user, category })

  const filters = await getRecordFilters(user, {categoryId: category.id.toString()})
  expect(filters.categoryId).toEqual({
    allCount: 2,
    items: [
      {key: '0', count: 1},
      {key: category.id.toString(), count: 1},
    ],
  })
})

test('counts by category with status type filter should be filtered', async () => {
  const user = await utils.factory.newUser()
  await utils.factory.newRecord({ user, category: undefined, statusType: StatusType.WATCHING })
  const category = await utils.factory.newCategory({ user })
  await utils.factory.newRecord({ user, category, statusType: StatusType.FINISHED })

  const filters = await getRecordFilters(user, {statusType: GqlStatusType.Watching})
  expect(filters.categoryId).toEqual({
    allCount: 1,
    items: [
      {key: '0', count: 1},
    ],
  })
})

test('counts by category with status type and category filter should be filtered only by status type', async () => {
  const user = await utils.factory.newUser()
  await utils.factory.newRecord({ user, category: undefined, statusType: StatusType.WATCHING })
  const category = await utils.factory.newCategory({ user })
  await utils.factory.newRecord({ user, category, statusType: StatusType.FINISHED })

  const filters = await getRecordFilters(user, {statusType: GqlStatusType.Watching, categoryId: category.id.toString()})
  expect(filters.categoryId).toEqual({
    allCount: 1,
    items: [
      {key: '0', count: 1},
    ],
  })
})

test('category id filter 0 is interpreted as records with no category', async () => {
  const user = await utils.factory.newUser()
  await utils.factory.newRecord({ user, category: undefined })
  const category = await utils.factory.newCategory({ user })
  await utils.factory.newRecord({ user, category })

  const filters = await getRecordFilters(user, {categoryId: '0'})
  expect(filters.statusType.allCount).toEqual(1)
})
