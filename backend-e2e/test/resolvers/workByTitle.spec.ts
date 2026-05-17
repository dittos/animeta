import { WorkDtoFragment, WorkDtoFragmentDoc } from '../fragments.generated'
import { getTestUtils, gql, TestUtils } from '../utils'

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test('get', async () => {
  const work = await utils.factory.newWork()
  const { data } = await utils.getHttpClient().query<{work: WorkDtoFragment}, any>(gql`
    query($title: String!) {
      work: workByTitle(title: $title) {
        ...WorkDTO
      }
    }
    ${WorkDtoFragmentDoc}
  `, {
    variables: {
      title: work.title,
    }
  })
  expect(data.work.id).toBe(work.id.toString())
})
