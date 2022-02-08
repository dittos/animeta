import { Controller, DefaultValuePipe, Get, Param, ParseBoolPipe, ParseIntPipe, Query } from "@nestjs/common";
import { PostDTO } from 'shared/types';
import { ApiException } from "./exceptions";
import { LessThan, Not, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PostSerializer, PostSerializerOptions } from "src/serializers/post.serializer";
import { History } from 'src/entities/history.entity'
import { ParseIntOrNullPipe } from "src/utils/parse_int_or_null.pipe";
import { Work } from "src/entities/work.entity";
import { StatusType } from "src/entities/status_type";

export type GetWorkPostsWithCountsResponse = {
  data: PostDTO[];
  userCount: number | null;
  suspendedUserCount: number | null;
}

@Controller('/api/v4/works/:id/posts')
export class WorkPostsController {
  constructor(
    @InjectRepository(Work) private workRepository: Repository<Work>,
    @InjectRepository(History) private historyRepository: Repository<History>,
    private postSerializer: PostSerializer,
  ) {}

  @Get()
  async get(
    @Param('id', new ParseIntPipe()) id: number,
    @Query('before_id', new ParseIntOrNullPipe()) beforeId: number | null,
    @Query('episode') episode: string | null,
    @Query('count', new ParseIntOrNullPipe(), new DefaultValuePipe(32)) count: number,
    @Query('withCounts', new DefaultValuePipe('false'), new ParseBoolPipe()) withCounts: boolean,
    @Query('options') optionsJson: string | null,
  ): Promise<PostDTO[] | GetWorkPostsWithCountsResponse> {
    const work = await this.workRepository.findOne(id)
    if (!work) throw ApiException.notFound()
    const posts = await this.historyRepository.find({
      relations: ['user'],
      where: {
        work_id: work.id,
        comment: Not(''),
        ...beforeId ? { id: LessThan(beforeId) } : {},
        ...episode ? { status: episode } : {},
      },
      order: { id: 'DESC' },
      take: Math.min(count, 128),
    })
    const options: PostSerializerOptions =
      optionsJson ? JSON.parse(optionsJson) : PostSerializer.legacyOptions({
        includeUser: true,
      })
    const data = await Promise.all(posts.map(it => this.postSerializer.serialize(it, options)))
    if (!withCounts)
      return data
    
    let userCount: number | null = null
    let suspendedUserCount: number | null = null
    if (episode) {
      const counts = (await this.historyRepository.createQueryBuilder()
        .select('status_type')
        .addSelect('COUNT(DISTINCT user_id)', 'count')
        .where('work_id = :workId AND status = :status', { workId: work.id, status: episode })
        .groupBy('status_type')
        .getRawMany())
        .map(it => ({
          statusType: it.status_type as StatusType,
          count: Number(it.count),
        }))
      userCount = counts.reduce((acc, it) => acc + it.count, 0)
      suspendedUserCount = counts.filter(it => it.statusType === StatusType.SUSPENDED)
        .reduce((acc, it) => acc + it.count, 0)
    } else {
      // TODO
    }
    return {
      data,
      userCount,
      suspendedUserCount,
    }
  }
}
