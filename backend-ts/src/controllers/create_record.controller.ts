import { Body, Controller, Post } from "@nestjs/common";
import { PostDTO, RecordDTO } from 'shared/types';
import { CurrentUser } from "src/auth/decorators";
import { StatusType } from "src/entities/status_type";
import { User } from "src/entities/user.entity";
import { PostSerializer, PostSerializerOptions } from "src/serializers/post.serializer";
import { RecordSerializer, RecordSerializerOptions } from "src/serializers/record.serializer";
import { RecordService } from "src/services/record.service";
import { TwitterService } from "src/services/twitter.service";
import { WorkService } from "src/services/work.service";
import { formatTweet } from "src/utils/tweet";
import { Connection } from "typeorm";

type Params = {
  title: string;
  categoryId: number | null;
  status: string;
  statusType: keyof typeof StatusType;
  comment: string;
  publishTwitter: boolean;
  rating?: number | null;
  options?: RecordSerializerOptions;
  postOptions?: PostSerializerOptions;
}

type Result = {
  record: RecordDTO | null;
  post: PostDTO | null;
}

@Controller('/api/v4/CreateRecord')
export class CreateRecordController {
  constructor(
    private connection: Connection,
    private recordSerializer: RecordSerializer,
    private postSerializer: PostSerializer,
    private twitterService: TwitterService,
    private recordService: RecordService,
    private workService: WorkService,
  ) {}

  @Post()
  async handle(
    @Body() params: Params,
    @CurrentUser() currentUser: User,
  ): Promise<Result> {
    const work = await this.workService.getOrCreate(params.title)
    const {record, history} = await this.connection.transaction(async em => {
      return this.recordService.createRecord(em, currentUser, work, {
        title: params.title,
        categoryId: params.categoryId,
        status: params.status,
        statusType: StatusType[params.statusType],
        comment: params.comment,
        rating: params.rating ?? null,
      })
    })
    
    if (params.publishTwitter) {
      await this.twitterService.updateStatus(currentUser, formatTweet(history))
    }

    return {
      record: params.options ? await this.recordSerializer.serialize(record, params.options) : null,
      post: params.postOptions ? await this.postSerializer.serialize(history, params.postOptions) : null,
    }
  }
}
