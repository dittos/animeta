import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { ChartItem, ChartItemWork } from "shared/types";
import { SundayStartWeekRange } from "src/utils/sunday_start_week_range";
import { Temporal } from "@js-temporal/polyfill";
import { Connection } from "typeorm";
import { Work } from "src/entities/work.entity";
import { History } from "src/entities/history.entity";
import { diff, ranked } from "src/utils/chart";
import { WorkService } from "./work.service";
import { Cache } from "cache-manager";

interface ChartRange {
  prev(): ChartRange
  startDate(): Temporal.PlainDate
  endDate(): Temporal.PlainDate
}

@Injectable()
export class ChartService {
  private readonly maxLimit = 100
  private readonly defaultTimeZone = Temporal.TimeZone.from('Asia/Seoul')

  constructor(
    private connection: Connection,
    private workService: WorkService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async getWeeklyWorks(limit: number): Promise<Array<ChartItem<ChartItemWork>>> {
    const range = SundayStartWeekRange.now(this.defaultTimeZone)
    const cacheKey = `getWeeklyWorks:${range.sunday}`
    const result = await this.cache.wrap<Array<ChartItem<ChartItemWork>>>(
      cacheKey,
      () => this.getPopularWorksUncached(range),
      { ttl: 60 * 60 }
    )
    return result.slice(0, limit)
  }

  private async getPopularWorksUncached(range: ChartRange): Promise<Array<ChartItem<ChartItemWork>>> {
    const [currentChart, prevChart] = await Promise.all([
      this.getPopularWorks(range),
      this.getPopularWorks(range.prev())
    ])
    const chart = diff(ranked(currentChart).slice(0, this.maxLimit), ranked(prevChart))
    const works = await Promise.all(chart.map(it => this.workService.get(it.object)))
    const worksById = new Map<number, Work>(works.map(it => [it.id, it]))
    return chart.map(item => {
      const work = worksById.get(item.object)!
      const newItem: ChartItem<ChartItemWork> = {
        ...item,
        object: {
          id: work.id,
          title: work.title,
          image_url: this.workService.getImageUrl(work),
          image_center_y: null,
        }
      }
      return newItem
    })
  }

  private async getPopularWorks(range: ChartRange): Promise<Array<[number, number]>> {
    const startInstant = range.startDate().toZonedDateTime({ timeZone: this.defaultTimeZone }).toInstant()
    const endInstant = range.endDate().add({ days: 1 }).toZonedDateTime({ timeZone: this.defaultTimeZone }).toInstant()
    const result = await this.connection.createQueryBuilder()
      .from(History, 'h')
      .select('h.work_id', 'workId')
      .addSelect('COUNT(DISTINCT h.user_id)', 'factor')
      .where('h.updated_at BETWEEN :start AND :end', { start: new Date(startInstant.epochMilliseconds), end: new Date(endInstant.epochMilliseconds) })
      .groupBy('h.work_id')
      .having('COUNT(DISTINCT h.user_id) > 1')
      .orderBy('factor', 'DESC')
      .limit(this.maxLimit)
      .getRawMany()
    return result.map(it => [it.workId, Number(it.factor)])
  }
}
