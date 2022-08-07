import { QueryResolvers } from "src/graphql/generated";
import { User } from "src/entities/user.entity";
import { Period } from "src/utils/period";
import { Temporal } from "@js-temporal/polyfill";
import { Work } from "src/entities/work.entity";
import { Record } from "src/entities/record.entity";
import { createRecommendationContext, generateRecommendations } from "src2/services/recommendation";
import { db } from "src2/database";
import { getRecordByUserAndWork } from "src2/services/record";

const defaultTimeZone = Temporal.TimeZone.from('Asia/Seoul')
const minPeriod = new Period(2014, 2)

export const tablePeriod: QueryResolvers['tablePeriod'] = async (_, { period: periodParam, onlyAdded, username, withRecommendations }, ctx) => {
  const period = Period.parse(periodParam)
  if (!period) throw new Error('invalid period: ' + periodParam)
  const maxPeriod = Period.now(defaultTimeZone).next()
  if (period.compareTo(minPeriod) < 0 || period.compareTo(maxPeriod) > 0) {
    throw new Error('no data')
  }
  const works = await db.find(Work, { where: {first_period: period.toString()} })
  const user = username ? await db.findOne(User, { where: {username} }) : ctx.currentUser
  if (!user) return works.map(work => ({ title: work.metadata?.title ?? work.title, work }))
  const records = await Promise.all(works.map(it => getRecordByUserAndWork(user, it)))
  const recordsByWorkId = new Map<number, Record>(records.filter(it => it).map(it => [it!.work_id, it!]))
  const recommendationContext = withRecommendations && user ? await createRecommendationContext(works.map(it => it.id), user) : null
  let result = works
  if (onlyAdded) {
    result = result.filter(it => recordsByWorkId.has(it.id))
  }
  return Promise.all(result.map(async work => {
    const record = recordsByWorkId.get(work.id) ?? null
    const title = work.metadata?.title ?? work.title
    if (recommendationContext) {
      const { recommendations, recommendationScore } = await generateRecommendations(work.id, recommendationContext)
      return {title, work, record, recommendations, recommendationScore}
    } else {
      return {title, work, record}
    }
  }))
}
