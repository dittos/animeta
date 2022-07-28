import { EpisodeDtoFragment, EpisodeDtoFragmentDoc } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('get', async () => {
  const work = await utils.factory.newWork()
  const episode = 1
  await utils.factory.newRecord({ work, status: episode.toString(), comment: 'hello' })

  const { data } = await utils.getHttpClient().query<{work: {episode: EpisodeDtoFragment}}, any>(gql`
    query($id: ID!, $episode: Int!) {
      work(id: $id) {
        episode(episode: $episode) {
          ...EpisodeDTO
        }
      }
    }
    ${EpisodeDtoFragmentDoc}
  `, {
    variables: {id: work.id, episode}
  })
  expect(data.work.episode).toEqual({
    number: episode,
    postCount: 1,
    userCount: 1,
    suspendedUserCount: 0,
  })
})
