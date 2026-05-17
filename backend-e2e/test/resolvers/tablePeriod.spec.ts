import { RecordDtoFragment, RecordDtoFragmentDoc, WorkDtoFragment, WorkDtoFragmentDoc } from '../fragments.generated'
import { getTestUtils, gql, Period, Periods, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

beforeEach(async () => await utils.factory.deleteAllWorks())

test('get', async () => {
  const period = new Period(2021, 1)
  const work = await utils.factory.newWork({ periods: [period] })

  const { data } = await utils.getHttpClient().query<{
    tablePeriod: {
      items: {
        work: WorkDtoFragment
        record: RecordDtoFragment | null
      }[]
    }
  }, any>(gql`
    query($period: String!) {
      tablePeriod(period: $period) {
        items {
          work {
            ...WorkDTO
          }
          record {
            ...RecordDTO
          }
        }
      }
    }
    ${WorkDtoFragmentDoc}
    ${RecordDtoFragmentDoc}
  `, {
    variables: {
      period: period.toString(),
    }
  })
  expect(data.tablePeriod.items.length).toBe(1)
  expect(data.tablePeriod.items[0].work.id).toBe(work.id.toString())
  expect(data.tablePeriod.items[0].record).toBeFalsy()
})

test('get with record', async () => {
  const period = new Period(2021, 1)
  const work = await utils.factory.newWork({ periods: [period] })
  const user = await utils.factory.newUser()
  const { record } = await utils.factory.newRecord({ user, work })
  const { data } = await utils.getHttpClientForUser(user).query<{
    tablePeriod: {
      items: {
        work: WorkDtoFragment
        record: RecordDtoFragment | null
      }[]
    }
  }, any>(gql`
    query($period: String!) {
      tablePeriod(period: $period) {
        items {
          work {
            ...WorkDTO
          }
          record {
            ...RecordDTO
          }
        }
      }
    }
    ${WorkDtoFragmentDoc}
    ${RecordDtoFragmentDoc}
  `, {
    variables: {
      period: period.toString(),
    }
  })
  expect(data.tablePeriod.items.length).toBe(1)
  expect(data.tablePeriod.items[0].work.id).toBe(work.id.toString())
  expect(data.tablePeriod.items[0].record?.id).toBe(record.id.toString())
})

test('get with recommendation', async () => {
  const period = Periods.current
  const work = await utils.factory.newWork({ periods: [period] })
  const user = await utils.factory.newUser()
  await utils.factory.newRecord({ user, work })

  const relatedWork = await utils.factory.newWork()
  await utils.factory.newRecord({ user, work: relatedWork })
  const staff = await utils.factory.addStaff(work, { personName: 'Kim PD', task: 'director' })
  await utils.factory.addStaff(relatedWork, { personId: staff.personId, task: 'director' })

  const { data } = await utils.getHttpClientForUser(user).query<{
    tablePeriod: {
      isRecommendationEnabled: boolean
      items: {
        work: WorkDtoFragment
        recommendations: any[]
        recommendationScore: number
      }[]
    }
  }, any>(gql`
    query($period: String!) {
      tablePeriod(period: $period) {
        isRecommendationEnabled
        items(withRecommendations: true) {
          work {
            ...WorkDTO
          }
          recommendations {
            ... on RecommendationByCredit {
              credit {
                type
                name
                personId
              }
              related {
                workId
                workTitle
                type
              }
              score
            }
          }
          recommendationScore
        }
      }
    }
    ${WorkDtoFragmentDoc}
  `, {
    variables: {
      period: period.toString(),
    }
  })
  // console.log(JSON.stringify(data.tablePeriod, null, 2))
  expect(data.tablePeriod.isRecommendationEnabled).toBeTruthy()
  expect(data.tablePeriod.items.length).toBe(1)
  expect(data.tablePeriod.items[0].work.id).toBe(work.id.toString())
  expect(data.tablePeriod.items[0].recommendations.length).toBe(1)
  expect(data.tablePeriod.items[0].recommendationScore).not.toBeNull()
})
