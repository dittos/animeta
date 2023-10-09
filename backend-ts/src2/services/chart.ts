import { SundayStartWeekRange } from "src/utils/sunday_start_week_range";
import { Temporal } from "@js-temporal/polyfill";
import { Work } from "src/entities/work.entity";
import { History } from "src/entities/history.entity";
import { diff, ranked } from "src/utils/chart";
import { caching } from "cache-manager";
import { getWorkImageUrl } from "src2/services/work";
import { db } from "src2/database";
import { getWork } from "./work";

export type WorkChartItem = {
  rank: number;
  work: {
    id: number;
    title: string;
    imageUrl: string | null;
  };
  diff?: number;
  sign?: number;
};

interface ChartRange {
  prev(): ChartRange
  startDate(): Temporal.PlainDate
  endDate(): Temporal.PlainDate
}

const maxLimit = 100
const defaultTimeZone = Temporal.TimeZone.from('Asia/Seoul')
const cache = caching({
  store: 'memory',
  ttl: 60 * 60,
})

export async function getWeeklyWorks(limit: number): Promise<Array<WorkChartItem>> {
  const range = SundayStartWeekRange.now(defaultTimeZone).prev()
  const cacheKey = `getWeeklyWorks:${range.sunday}`
  const result = await cache.wrap<Array<WorkChartItem>>(
    cacheKey,
    () => getPopularWorksUncached(range),
    { ttl: 60 * 60 }
  )
  return result.slice(0, limit)
}

async function getPopularWorksUncached(range: ChartRange): Promise<Array<WorkChartItem>> {
  const [currentChart, prevChart] = await Promise.all([
    getPopularWorks(range, maxLimit),
    getPopularWorks(range.prev())
  ])
  const chart = diff(ranked(currentChart), ranked(prevChart))
  const works = await Promise.all(chart.map(it => getWork(it.object)))
  const worksById = new Map<number, Work>(works.map(it => [it.id, it]))
  return chart.map(item => {
    const work = worksById.get(item.object)!
    const newItem: WorkChartItem = {
      ...item,
      work: {
        id: work.id,
        title: work.title,
        imageUrl: getWorkImageUrl(work),
      }
    }
    return newItem
  })
}

async function getPopularWorks(range: ChartRange, limit?: number): Promise<Array<[number, number]>> {
  const startInstant = range.startDate().toZonedDateTime({ timeZone: defaultTimeZone }).toInstant()
  const endInstant = range.endDate().add({ days: 1 }).toZonedDateTime({ timeZone: defaultTimeZone }).toInstant()
  let qb = db.createQueryBuilder()
    .from(History, 'h')
    .select('h.work_id', 'workId')
    .addSelect('COUNT(DISTINCT h.user_id)', 'factor')
    .where('h.updated_at BETWEEN :start AND :end', { start: new Date(startInstant.epochMilliseconds), end: new Date(endInstant.epochMilliseconds) })
    .groupBy('h.work_id')
    .having('COUNT(DISTINCT h.user_id) > 1')
    .orderBy('factor', 'DESC')
  if (limit) qb = qb.limit(limit)
  const result = await qb.getRawMany()
  return result.map(it => [it.workId, Number(it.factor)])
}
