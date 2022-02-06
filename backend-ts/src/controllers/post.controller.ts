import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { PostDTO } from 'shared/types';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApiException } from "./exceptions";
import { History } from "src/entities/history.entity";
import { PostSerializer, PostSerializerOptions } from "src/serializers/post.serializer";

@Controller('/api/v4/posts/:id')
export class PostController {
  constructor(
    @InjectRepository(History) private historyRepository: Repository<History>,
    private postSerializer: PostSerializer,
  ) {}

  @Get()
  async get(
    @Param('id', new ParseIntPipe()) id: number,
    @Query('options') optionsJson: string | null,
  ): Promise<PostDTO> {
    const history = await this.historyRepository.findOne(id)
    if (!history) throw ApiException.notFound()
    const options: PostSerializerOptions =
      optionsJson ? JSON.parse(optionsJson) : PostSerializer.legacyOptions({
        includeRecord: true,
        includeUser: true,
      })
    return this.postSerializer.serialize(history, options)
  }
}
