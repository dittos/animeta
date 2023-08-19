import { CreatePostInput, CreatePostResult, PostDtoFragment, PostDtoFragmentDoc, RecordDtoFragment, RecordDtoFragmentDoc, StatusType } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('create post', async () => {
  const user = await utils.factory.newUser()
  const {record} = await utils.factory.newRecord({ user })
  const input: CreatePostInput = {
    recordId: record.id.toString(),
    status: '2',
    statusType: StatusType.Watching,
    comment: '2',
    containsSpoiler: true,
    publishTwitter: false,
    rating: null,
  }
  const { data, errors } = await utils.getHttpClientForUser(user).query<{createPost: CreatePostResult}, any>(gql`
    mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        post {
          ...PostDTO
          record {
            ...RecordDTO
          }
        }
      }
    }
    ${PostDtoFragmentDoc}
    ${RecordDtoFragmentDoc}
  `, {
    variables: {
      input
    }
  })
  expect(errors).toBeFalsy()

  const post = data.createPost.post as PostDtoFragment
  const gqlRecord = data.createPost.post.record as RecordDtoFragment
  expect(post).toMatchObject<Partial<PostDtoFragment>>({
    status: input.status,
    statusType: input.statusType,
    comment: input.comment,
    containsSpoiler: input.containsSpoiler,
    rating: null,
  })
  expect(gqlRecord).toMatchObject<Partial<RecordDtoFragment>>({
    id: input.recordId,
    status: input.status,
    statusType: input.statusType,
    updatedAt: post.updatedAt,
  })
})

test('create post with invalid rating', async () => {
  const user = await utils.factory.newUser()
  const {record} = await utils.factory.newRecord({ user })
  const input: CreatePostInput = {
    recordId: record.id.toString(),
    status: '2',
    statusType: StatusType.Watching,
    comment: '2',
    containsSpoiler: false,
    publishTwitter: false,
    rating: 100,
  }
  const { errors } = await utils.getHttpClientForUser(user).rawQuery<{createPost: CreatePostResult}, any>(gql`
    mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        post {
          ...PostDTO
        }
      }
    }
    ${PostDtoFragmentDoc}
  `, {
    variables: {
      input
    }
  })
  expect(errors).toBeTruthy()
})
