import { QueryResolvers } from "src/graphql/generated";
import { getWeeklyWorks } from "src/services/chart";
import { getWork } from "src/services/work";

export const weeklyWorksChart: QueryResolvers['weeklyWorksChart'] = async (_, { limit }) => {
  const items = await getWeeklyWorks(limit)
  return Promise.all(items.map(async item => ({
    rank: item.rank,
    work: await getWork(item.work.id),
    diff: item.diff,
    sign: item.sign,
  })))
}
