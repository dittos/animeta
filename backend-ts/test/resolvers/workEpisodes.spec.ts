import { EpisodeDtoFragment, EpisodeDtoFragmentDoc } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('get', async () => {
  const work = await utils.factory.newWork()
  const episode = 1
  await utils.factory.newRecord({ work, status: episode.toString(), comment: 'hello' })
  await utils.factory.newRecord({ work, status: 'NaN', comment: 'hello' })

  const { data } = await utils.getHttpClient().query<{work: {episodes: EpisodeDtoFragment[]}}, any>(gql`
    query($id: ID!) {
      work(id: $id) {
        episodes {
          ...EpisodeDTO
        }
      }
    }
    ${EpisodeDtoFragmentDoc}
  `, {
    variables: {id: work.id}
  })

  // only numeric statuses are counted as episode
  expect(data.work.episodes).toEqual([{
    number: episode,
    postCount: 1,
    userCount: 1,
    suspendedUserCount: 0,
  }])
})
