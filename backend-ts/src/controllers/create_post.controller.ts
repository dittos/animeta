import { Body, Controller, Post } from "@nestjs/common";
import { PostDTO, StatusType as StatusTypeParam } from 'shared/types';
import { CurrentUser } from "src/auth/decorators";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { User } from "src/entities/user.entity";
import { PostSerializer, PostSerializerOptions } from "src/serializers/post.serializer";
import { RecordService } from "src/services/record.service";
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
    private recordService: RecordService,
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
      
      return this.recordService.addHistory(em, record, {
        status: params.status,
        statusType: StatusType[params.statusType.toUpperCase() as keyof typeof StatusType],
        comment: params.comment,
        containsSpoiler: params.containsSpoiler,
        rating: params.rating ?? null,
      })
    })
    
    if (params.publishTwitter) {
      await this.twitterService.updateStatus(currentUser, formatTweet(history))
    }

    return {
      post: params.options ? await this.postSerializer.serialize(history, params.options) : null,
    }
  }
}
