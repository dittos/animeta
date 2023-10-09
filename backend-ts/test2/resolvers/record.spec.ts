import { RecordId } from 'src/resolvers/id'
import { RecordDtoFragment, RecordDtoFragmentDoc } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('get non-existent record', async () => {
  const { data, errors } = await utils.getHttpClient().query<{record: RecordDtoFragment}, any>(gql`
    query($id: ID!) {
      record(id: $id) {
        ...RecordDTO
      }
    }
    ${RecordDtoFragmentDoc}
  `, {
    variables: {
      id: '0',
    }
  })
  expect(data.record).toBeNull()
  expect(errors).toBeFalsy()
})

test('get', async () => {
  const { record } = await utils.factory.newRecord()
  const { data } = await utils.getHttpClient().query<{record: RecordDtoFragment}, any>(gql`
    query($id: ID!) {
      record(id: $id) {
        ...RecordDTO
      }
    }
    ${RecordDtoFragmentDoc}
  `, {
    variables: {
      id: record.id,
    }
  })
  expect(data.record.id).toBe(record.id.toString())
})

test('get by node id', async () => {
  const { record } = await utils.factory.newRecord()
  const { data } = await utils.getHttpClient().query<{record: RecordDtoFragment}, any>(gql`
    query($id: ID!) {
      record(id: $id) {
        ...RecordDTO
      }
    }
    ${RecordDtoFragmentDoc}
  `, {
    variables: {
      id: RecordId.fromDatabaseId(record.id),
    }
  })
  expect(data.record.id).toBe(record.id.toString())
})

test('get posts', async () => {
  const { record, history } = await utils.factory.newRecord()
  const { data } = await utils.getHttpClient().query<{record: any}, any>(gql`
    query($id: ID!) {
      record(id: $id) {
        posts(beforeId: null, count: null) {
          nodes {
            id
          }
          hasMore
        }
      }
    }
  `, {
    variables: {
      id: record.id,
    }
  })
  expect(data.record.posts).toStrictEqual({
    nodes: [{ id: history.id.toString() }],
    hasMore: false,
  })
})
