import { Controller, DefaultValuePipe, Get, Query } from "@nestjs/common";
import { PostDTO } from 'shared/types';
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Not, Repository } from "typeorm";
import { History } from "src/entities/history.entity";
import { WorkService } from "src/services/work.service";
import { PostSerializer, PostSerializerOptions } from "src/serializers/post.serializer";
import { ParseIntOrNullPipe } from "src/utils/parse_int_or_null.pipe";

@Controller('/api/v4/posts')
export class PostsController {
  constructor(
    private workService: WorkService,
    @InjectRepository(History) private historyRepository: Repository<History>,
    private postSerializer: PostSerializer,
  ) {}

  @Get()
  async get(
    @Query('before_id', new ParseIntOrNullPipe()) beforeId: number | null,
    @Query('min_record_count', new ParseIntOrNullPipe()) minRecordCount: number | null,
    @Query('count', new ParseIntOrNullPipe(), new DefaultValuePipe(32)) count: number | null,
    @Query('options') optionsJson: string | null,
  ): Promise<PostDTO[]> {
    const limit = Math.min(count, 128)
    const options: PostSerializerOptions | null =
      optionsJson ? JSON.parse(optionsJson) : PostSerializer.legacyOptions({
        includeRecord: true,
        includeUser: true,
      })
    let posts: History[]
    if (minRecordCount != null) {
      const filteredPosts: History[] = []
      let batchBeforeId = beforeId
      let queryCount = 0
      while (filteredPosts.length < limit && queryCount < 5) {
        const maxBatchSize = Math.max(32, limit - filteredPosts.length)
        const batch = await this.historyRepository.find({
          relations: ['user', 'record'],
          where: {
            comment: Not(''),
            ...batchBeforeId ? { id: LessThan(batchBeforeId) } : {},
          },
          order: {
            id: 'DESC',
          },
          take: maxBatchSize,
        })
        queryCount++
        const workIndexes = await Promise.all(batch.map(it => this.workService.getIndex(it.work_id)))
        const filteredBatch = batch.filter(history => {
          const recordCount = workIndexes.find(it => history.work_id === it?.work_id)?.record_count ?? 0
          return recordCount >= minRecordCount
        })
        filteredPosts.push(...filteredBatch)
        batchBeforeId = batch[batch.length - 1]?.id
        if (batch.length < maxBatchSize) {
          // no more posts to find
          break
        }
      }
      posts = filteredPosts
    } else {
      posts = await this.historyRepository.find({
        relations: ['user', 'record'],
        where: {
          comment: Not(''),
          ...beforeId ? { id: LessThan(beforeId) } : {},
        },
        order: {
          id: 'DESC',
        },
        take: limit,
      })
    }
    return await Promise.all(posts.map(it => this.postSerializer.serialize(it, options)))
  }
}
