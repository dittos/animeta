import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RecordDTO } from "shared/types_generated";
import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { UserService } from "src/services/user.service";
import { MoreThan, Repository } from "typeorm";
import { UserSerializer, UserSerializerOptions } from "./user.serializer";

export type RecordSerializerOptions = {
  hasNewerEpisode?: boolean;
  user?: UserSerializerOptions;
}

@Injectable()
export class RecordSerializer {
  static legacyOptions({
    includeHasNewerEpisode = false,
    includeUser = false,
    includeUserStats = false,
  }: {
    includeHasNewerEpisode?: boolean,
    includeUser?: boolean,
    includeUserStats?: boolean,
  } = {}): RecordSerializerOptions {
    return {
      hasNewerEpisode: includeHasNewerEpisode,
      user: includeUser ? UserSerializer.legacyOptions({
        includeCategories: true,
        includeStats: includeUserStats,
      }) : undefined,
    }
  }

  constructor(
    private userService: UserService,
    private userSerializer: UserSerializer,
    @InjectRepository(History) private historyRepository: Repository<History>,
  ) {}

  async serialize(record: Record, options: RecordSerializerOptions): Promise<RecordDTO> {
    return {
      id: record.id,
      user_id: record.user_id,
      work_id: record.work_id,
      category_id: record.category_id,
      title: record.title,
      status: record.status,
      status_type: StatusType[record.status_type].toLowerCase(),
      updated_at: record.updated_at?.getTime() ?? null,
      has_newer_episode: options.hasNewerEpisode ? await this.hasNewerEpisode(record) : null,
      user: options.user ? await this.userSerializer.serialize(await this.userService.get(record.user_id), null, options.user) : null,
      rating: record.rating,
    }
  }

  async hasNewerEpisode(record: Record): Promise<boolean> {
    if (record.status_type !== StatusType.WATCHING)
      return false
    
    if (!/^[0-9]+$/.test(record.status))
      return false
    const episode = Number(record.status)

    if (!record.updated_at)
      return false

    return (await this.historyRepository.count({
      where: {
        work_id: record.work_id,
        status: `${episode + 1}`,
        updated_at: MoreThan(record.updated_at),
      },
      take: 1,
    })) > 0
  }
}
