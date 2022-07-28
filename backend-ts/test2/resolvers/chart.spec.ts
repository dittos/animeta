import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('get', async () => {
  const { data } = await utils.getHttpClient().query<{weeklyWorksChart: any}, any>(gql`
    {
      weeklyWorksChart(limit: 5) {
        rank
        work {
          id
          title
          imageUrl
        }
        diff
        sign
      }
    }
  `)
  // TODO: actual data
  expect(data.weeklyWorksChart).toEqual([])
})
