import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { PostDTO } from 'shared/types';
import { ApiException } from "./exceptions";
import { RecordService } from "src/services/record.service";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PostSerializer, PostSerializerOptions } from "src/serializers/post.serializer";
import { History } from 'src/entities/history.entity'

@Controller('/api/v4/records/:id/posts')
export class RecordPostsController {
  constructor(
    private recordService: RecordService,
    @InjectRepository(History) private historyRepository: Repository<History>,
    private postSerializer: PostSerializer,
  ) {}

  @Get()
  async get(
    @Param('id', new ParseIntPipe()) id: number,
    @Query('options') optionsJson: string | null,
  ): Promise<{ posts: PostDTO[] }> {
    const record = await this.recordService.get(id)
    if (!record) throw ApiException.notFound()
    const posts = await this.historyRepository.find({
      where: { record },
      order: { id: 'DESC' },
    })
    const options: PostSerializerOptions =
      optionsJson ? JSON.parse(optionsJson) : PostSerializer.legacyOptions()
    return {
      posts: await Promise.all(posts.map(it => this.postSerializer.serialize(it, options))),
    }
  }
}
