import { User } from "src/entities/user.entity";
import { Period } from "src/utils/period";
import { Work } from "src/entities/work.entity";
import { Record } from "src/entities/record.entity";
import { createRecommendationContext, generateRecommendations, Recommendation } from "src2/services/recommendation";
import { db } from "src2/database";
import { getRecordByUserAndWork } from "src2/services/record";

export const Periods = {
  current: Period.parseOrThrow("2023Q4"),
  min: Period.parseOrThrow("2014Q2"),
  upcoming: Period.parseOrThrow("2023Q4"),
}

export function getValidPeriods(): Period[] {
  const periods: Period[] = []
  for (let y = Periods.current.year; y >= 2014; y--) {
    [4, 3, 2, 1].forEach(q => {
      const period = new Period(y, q)
      const isValidPeriod = Periods.min.compareTo(period) <= 0 && period.compareTo(Periods.current) <= 0
      if (isValidPeriod) {
        periods.push(period)
      }
    })
  }
  return periods
}

export function isRecommendationEnabled(period: Period): boolean {
  return period.equals(Periods.current) || period.equals(Periods.upcoming)
}

export async function getTablePeriodItems(
  period: Period,
  onlyAdded: boolean,
  username: string | null,
  withRecommendations: boolean,
  currentUser: User | null,
): Promise<{
  title: string;
  work: Work;
  record?: Record | null;
  recommendations?: Recommendation[];
  recommendationScore?: number;
}[]> {
  const works = await db.find(Work, { where: {first_period: period.toString()} })
  const user = username ? await db.findOne(User, { where: {username} }) : currentUser
  if (!user) return works.map(work => ({ title: work.metadata?.title ?? work.title, work }))
  const records = await Promise.all(works.map(it => getRecordByUserAndWork(user, it)))
  const recordsByWorkId = new Map<number, Record>(records.filter(it => it).map(it => [it!.work_id, it!]))
  const recommendationContext = withRecommendations && isRecommendationEnabled(period) && user
    ? await createRecommendationContext(works.map(it => it.id), user)
    : null
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
