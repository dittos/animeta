import { rebuildWorkIndex } from 'src/services/indexer'
import { PostDtoFragment, PostDtoFragmentDoc } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

beforeEach(async () => await utils.factory.deleteAllRecords())

test('get', async () => {
  const work = await utils.factory.newWork()
  const history1 = (await utils.factory.newRecord({ work, comment: 'hello' })).history
  const history2 = (await utils.factory.newRecord({ work, comment: 'hello' })).history
  await rebuildWorkIndex()

  const { data } = await utils.getHttpClient().query<{timeline: PostDtoFragment[]}, any>(gql`
    query {
      timeline {
        ...PostDTO
      }
    }
    ${PostDtoFragmentDoc}
  `)
  expect(data.timeline.length).toBe(2)
  expect(data.timeline[0].id).toBe(history2.id.toString())
  expect(data.timeline[1].id).toBe(history1.id.toString())
})

test('get should not contain posts without enough record count', async () => {
  await utils.factory.newRecord({ comment: 'hello' })
  const { data } = await utils.getHttpClient().query<{timeline: PostDtoFragment[]}, any>(gql`
    query {
      timeline {
        ...PostDTO
      }
    }
    ${PostDtoFragmentDoc}
  `)
  expect(data.timeline.length).toBe(0)
})
