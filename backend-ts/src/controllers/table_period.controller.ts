import { CACHE_MANAGER, Controller, DefaultValuePipe, Get, Inject, Param, ParseBoolPipe, Query } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators";
import { User } from "src/entities/user.entity";
import { ApiException } from "./exceptions";
import { WorkSerializer } from "src/serializers/work.serializer";
import { RecordDTO, WorkDTO } from "shared/types";
import { Period } from "src/utils/period";
import { Temporal } from "@js-temporal/polyfill";
import { Cache } from "cache-manager";
import { Repository } from "typeorm";
import { Work } from "src/entities/work.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { RecordService } from "src/services/record.service";
import { RecordSerializer } from "src/serializers/record.serializer";
import { RecommendationService } from "src/services/recommendation.service";

@Controller('/api/v4/table/periods/:period([0-9]{4}Q[1-4])')
export class TablePeriodController {
  private defaultTimeZone = Temporal.TimeZone.from('Asia/Seoul')
  private minPeriod = new Period(2014, 2)

  constructor(
    @InjectRepository(Work) private workRepository: Repository<Work>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private recordService: RecordService,
    private recommendationService: RecommendationService,
    private workSerializer: WorkSerializer,
    private recordSerializer: RecordSerializer,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  @Get()
  async get(
    @Param('period') periodParam: string,
    @Query('with_recommendations', new DefaultValuePipe('false'), new ParseBoolPipe()) withRecommendations: boolean,
    @Query('only_added', new DefaultValuePipe('false'), new ParseBoolPipe()) onlyAdded: boolean, 
    @Query('username') username: string | null,
    @CurrentUser({ required: false }) currentUser: User | null,
  ): Promise<WorkDTO[]> {
    const period = Period.parse(periodParam)
    if (!period) throw ApiException.notFound()
    const maxPeriod = Period.now(this.defaultTimeZone).next()
    if (period.compareTo(this.minPeriod) < 0 || period.compareTo(maxPeriod) > 0) {
      throw ApiException.notFound()
    }
    const cacheKey = `table:${period}`
    let result = await this.cache.wrap<WorkDTO[]>(cacheKey, async () => {
      const works = await this.workRepository.find({ where: {first_period: period.toString()} })
      return Promise.all(works.map(work => this.workSerializer.serialize(work)))
    }, { ttl: 60 * 60 })
    const user = username ? await this.userRepository.findOne({ where: {username} }) : currentUser
    if (!user) return result
    const records = await Promise.all(result.map(async it => {
      const record = await this.recordService.findByUserAndWorkId(user, it.id)
      if (!record) return null
      return await this.recordSerializer.serialize(record, RecordSerializer.legacyOptions())
    }))
    const recordsByWorkId = new Map<number, RecordDTO>(records.filter(it => it).map(it => [it!.work_id, it!]))
    const recommendationContext = withRecommendations && user ? await this.recommendationService.createContext(result.map(it => it.id), user) : null
    if (onlyAdded) {
      result = result.filter(it => recordsByWorkId.has(it.id))
    }
    return Promise.all(result.map(async it => {
      const record = recordsByWorkId.get(it.id) ?? null
      if (recommendationContext) {
        const { recommendations, recommendationScore } = await this.recommendationService.generate(it.id, recommendationContext)
        return {...it, record, recommendations, recommendationScore}
      } else {
        return {...it, record}
      }
    }))
  }
}
