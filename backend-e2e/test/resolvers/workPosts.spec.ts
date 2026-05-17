import { PostDtoFragment, PostDtoFragmentDoc } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('get', async () => {
  const work = await utils.factory.newWork()
  const history = (await utils.factory.newRecord({ work, comment: 'hello' })).history

  const { data } = await utils.getHttpClient().query<{work: {posts: {nodes: PostDtoFragment[]}}}, any>(gql`
    query($id: ID!) {
      work(id: $id) {
        posts {
          nodes {
            ...PostDTO
          }
        }
      }
    }
    ${PostDtoFragmentDoc}
  `, {
    variables: {id: work.id}
  })
  expect(data.work.posts.nodes.length).toBe(1)
  expect(data.work.posts.nodes[0].id).toBe(history.id.toString())
})

test('get with episode filter', async () => {
  const work = await utils.factory.newWork()
  const episode = 1
  const history = (await utils.factory.newRecord({ work, status: episode.toString(), comment: 'hello' })).history

  const { data } = await utils.getHttpClient().query<{work: {posts: {nodes: PostDtoFragment[]}}}, any>(gql`
    query($id: ID!, $episode: Int!) {
      work(id: $id) {
        posts(episode: $episode) {
          nodes {
            ...PostDTO
          }
        }
      }
    }
    ${PostDtoFragmentDoc}
  `, {
    variables: {id: work.id, episode}
  })
  expect(data.work.posts.nodes.length).toBe(1)
  expect(data.work.posts.nodes[0].id).toBe(history.id.toString())
})

test('get with episode filter includes statuses with leading zero', async () => {
  const work = await utils.factory.newWork()
  const history = (await utils.factory.newRecord({ work, status: '01', comment: 'hello' })).history

  const { data } = await utils.getHttpClient().query<{work: {posts: {nodes: PostDtoFragment[]}}}, any>(gql`
    query($id: ID!, $episode: Int!) {
      work(id: $id) {
        posts(episode: $episode) {
          nodes {
            ...PostDTO
          }
        }
      }
    }
    ${PostDtoFragmentDoc}
  `, {
    variables: {id: work.id, episode: 1}
  })
  expect(data.work.posts.nodes.length).toBe(1)
  expect(data.work.posts.nodes[0].id).toBe(history.id.toString())
})
