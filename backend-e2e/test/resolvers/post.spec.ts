import { PostDtoFragment, PostDtoFragmentDoc } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('get non-existent post', async () => {
  const { data, errors } = await utils.getHttpClient().query<{post: PostDtoFragment}, any>(gql`
    query($id: ID!) {
      post(id: $id) {
        ...PostDTO
      }
    }
    ${PostDtoFragmentDoc}
  `, {
    variables: {
      id: '0',
    }
  })
  expect(data.post).toBeNull()
  expect(errors).toBeFalsy()
})

test('get', async () => {
  const { history } = await utils.factory.newRecord()
  const { data } = await utils.getHttpClient().query<{post: PostDtoFragment}, any>(gql`
    query($id: ID!) {
      post(id: $id) {
        ...PostDTO
      }
    }
    ${PostDtoFragmentDoc}
  `, {
    variables: {
      id: history.id,
    }
  })
  expect(data.post.id).toBe(history.id.toString())
})

test('get episode for status wiht leading zero', async () => {
  const { history } = await utils.factory.newRecord({
    status: '01',
    comment: 'hi',
  })
  const { data } = await utils.getHttpClient().query<{post: {episode: {number: number}}}, any>(gql`
    query($id: ID!) {
      post(id: $id) {
        episode {
          number
        }
      }
    }
  `, {
    variables: {
      id: history.id,
    }
  })
  expect(data.post.episode.number).toBe(1)
})
