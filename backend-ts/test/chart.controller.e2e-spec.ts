import { getTestUtils, TestUtils } from './utils';

describe('ChartController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils());
  afterAll(() => utils.close());

  it(`get`, async () => {
    // TODO: actual data
    return utils.getHttpClient()
      .get('/api/v4/charts/works/weekly?limit=5')
      .expect(200);
  });
});
