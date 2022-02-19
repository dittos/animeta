import { Body, Controller, HttpStatus, Post } from "@nestjs/common";
import { PostDTO, StatusType as StatusTypeParam } from 'shared/types';
import { CurrentUser } from "src/auth/decorators";
import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { User } from "src/entities/user.entity";
import { PostSerializer, PostSerializerOptions } from "src/serializers/post.serializer";
import { TwitterService } from "src/services/twitter.service";
import { formatTweet } from "src/utils/tweet";
import { Connection } from "typeorm";
import { ApiException } from "./exceptions";

type Params = {
  recordId: number;
  status: string;
  statusType: StatusTypeParam;
  comment: string;
  containsSpoiler: boolean;
  publishTwitter: boolean;
  rating?: number | null;
  options?: PostSerializerOptions;
}

type Result = {
  post: PostDTO | null;
}

@Controller('/api/v4/CreatePost')
export class CreatePostController {
  constructor(
    private connection: Connection,
    private postSerializer: PostSerializer,
    private twitterService: TwitterService,
  ) {}

  @Post()
  async handle(
    @Body() params: Params,
    @CurrentUser() currentUser: User,
  ): Promise<Result> {
    const history = await this.connection.transaction(async em => {
      const record = await em.findOne(Record, params.recordId)
      if (!record)
        throw ApiException.notFound()
      if (currentUser.id !== record.user_id)
        throw ApiException.permissionDenied()
      if (params.rating != null && ![1, 2, 3, 4, 5].includes(params.rating))
        throw new ApiException('별점은 1부터 5까지 입력할 수 있습니다.', HttpStatus.BAD_REQUEST)
      const history = new History()
      history.user = currentUser
      history.work_id = record.work_id
      history.record = record
      history.status = params.status
      history.status_type = StatusType[params.statusType.toUpperCase() as keyof typeof StatusType]
      history.comment = params.comment
      history.contains_spoiler = params.containsSpoiler
      history.updated_at = new Date()
      history.rating = params.rating ?? null
      await em.save(history)

      record.status_type = history.status_type
      record.status = history.status
      record.updated_at = history.updated_at
      await em.save(record)

      return history
    })
    
    if (params.publishTwitter) {
      await this.twitterService.updateStatus(currentUser, formatTweet(history))
    }

    return {
      post: params.options ? await this.postSerializer.serialize(history, params.options) : null,
    }
  }
}
