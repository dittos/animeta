import { Injectable } from "@nestjs/common";
import { PostDTO } from "shared/types_generated";
import { History } from "src/entities/history.entity";
import { StatusType } from "src/entities/status_type";
import { RecordSerializer, RecordSerializerOptions } from "./record.serializer";
import { UserSerializer, UserSerializerOptions } from "./user.serializer";

export type PostSerializerOptions = {
  record?: RecordSerializerOptions;
  user?: UserSerializerOptions;
}

@Injectable()
export class PostSerializer {
  static legacyOptions({
    includeRecord = false,
    includeUser = false,
  }: {
    includeRecord?: boolean;
    includeUser?: boolean;
  } = {}): PostSerializerOptions {
    return {
      record: includeRecord ? RecordSerializer.legacyOptions() : undefined,
      user: includeUser ? UserSerializer.legacyOptions({ includeCategories: false }) : undefined,
    }
  }

  constructor(
    private recordSerializer: RecordSerializer,
    private userSerializer: UserSerializer,
  ) {
  }

  async serialize(history: History, options: PostSerializerOptions): Promise<PostDTO> {
    return {
      id: history.id,
      record_id: history.record.id,
      status: history.status,
      status_type: StatusType[history.status_type].toLowerCase(),
      comment: history.comment,
      updated_at: history.updated_at?.getTime() ?? null,
      contains_spoiler: history.contains_spoiler,
      record: options.record ? await this.recordSerializer.serialize(history.record, options.record ?? {}) : null,
      user: options.user ? await this.userSerializer.serialize(history.user, null, options.user ?? {}) : null,
      rating: history.rating,
    }
  }
}
