import { WorkDtoFragment, WorkDtoFragmentDoc } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('get', async () => {
  const work = await utils.factory.newWork()
  const { data } = await utils.getHttpClient().query<{work: WorkDtoFragment}, any>(gql`
    query($id: ID!) {
      work(id: $id) {
        ...WorkDTO
      }
    }
    ${WorkDtoFragmentDoc}
  `, {
    variables: {
      id: work.id,
    }
  })
  expect(data.work.id).toBe(work.id.toString())
})

test('get schedule with date only', async () => {
  const work = await utils.factory.newWork({
    metadata: {
      schedules: {
        'kr': {
          date: '2023-01-10',
          datePrecision: 'DATE',
        }
      }
    }
  })
  const { data } = await utils.getHttpClient().query<{work: WorkDtoFragment}, any>(gql`
    query($id: ID!) {
      work(id: $id) {
        ...WorkDTO
      }
    }
    ${WorkDtoFragmentDoc}
  `, {
    variables: {
      id: work.id,
    }
  })
  expect(data.work.id).toBe(work.id.toString())
  expect(new Date(data.work.metadata!.schedules![0].date)).toEqual(new Date('2023-01-10T00:00:00+09:00'))
})

test('get schedule with date+time', async () => {
  const work = await utils.factory.newWork({
    metadata: {
      schedules: {
        'kr': {
          date: '2023-01-10T01:00:00',
          datePrecision: 'DATE_TIME',
        }
      }
    }
  })
  const { data } = await utils.getHttpClient().query<{work: WorkDtoFragment}, any>(gql`
    query($id: ID!) {
      work(id: $id) {
        ...WorkDTO
      }
    }
    ${WorkDtoFragmentDoc}
  `, {
    variables: {
      id: work.id,
    }
  })
  expect(data.work.id).toBe(work.id.toString())
  expect(new Date(data.work.metadata!.schedules![0].date)).toEqual(new Date('2023-01-10T01:00:00+09:00'))
})
