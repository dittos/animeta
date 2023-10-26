import { getTestUtils, TestUtils } from '../../utils';

let utils: TestUtils
beforeAll(async () => utils = await getTestUtils())
afterAll(() => utils.close())

test(`merge work with conflicts`, async () => {
  const user = await utils.factory.newUser({ isStaff: true })
  const work = await utils.factory.newWork()
  const otherWork = await utils.factory.newWork()
  const record = (await utils.factory.newRecord({ user, work })).record
  const otherRecord = (await utils.factory.newRecord({ user, work: otherWork })).record

  const res = await utils.getHttpClientForUser(user)
    .call('/api/admin/v1/WorkMergeForm/merge', {
      workId: work.id,
      otherWorkId: otherWork.id,
      forceMerge: false,
    })
  expect(res.statusCode).toEqual(400)
  expect(res.json()).toMatchObject({
    message: "Users with conflict exist",
    extra: {
      conflicts: [
        {
          user_id: user.id,
          username: user.username,
          ids: [record.id, otherRecord.id],
        }
      ]
    }
  })
});
