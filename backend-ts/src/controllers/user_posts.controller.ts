import { Controller, DefaultValuePipe, Get, Param, Query } from "@nestjs/common";
import { PostDTO } from 'shared/types';
import { ApiException } from "./exceptions";
import { LessThan, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PostSerializer, PostSerializerOptions } from "src/serializers/post.serializer";
import { History } from 'src/entities/history.entity'
import { User } from "src/entities/user.entity";
import { ParseIntOrNullPipe } from "src/utils/parse_int_or_null.pipe";

@Controller('/api/v4/users/:name/posts')
export class UserPostsController {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(History) private historyRepository: Repository<History>,
    private postSerializer: PostSerializer,
  ) {}

  @Get()
  async get(
    @Param('name') name: string,
    @Query('before_id', new ParseIntOrNullPipe()) beforeId: number | null,
    @Query('count', new ParseIntOrNullPipe(), new DefaultValuePipe(32)) count: number,
    @Query('options') optionsJson: string | null,
  ): Promise<PostDTO[]> {
    const user = await this.userRepository.findOne({ where: {username: name} })
    if (!user) throw ApiException.notFound()
    const posts = await this.historyRepository.find({
      relations: ['record'],
      where: {
        user,
        ...beforeId ? { id: LessThan(beforeId) } : {},
      },
      order: { id: 'DESC' },
      take: Math.min(count, 128),
    })
    const options: PostSerializerOptions =
      optionsJson ? JSON.parse(optionsJson) : PostSerializer.legacyOptions({
        includeRecord: true,
      })
    return await Promise.all(posts.map(it => this.postSerializer.serialize(it, options)))
  }
}
