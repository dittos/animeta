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
