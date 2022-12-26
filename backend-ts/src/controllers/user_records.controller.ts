import { Controller, DefaultValuePipe, Get, Param, ParseBoolPipe, Query } from "@nestjs/common";
import { PostDTO, RecordDTO } from 'shared/types';
import { ApiException } from "./exceptions";
import { LessThan, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PostSerializer, PostSerializerOptions } from "src/serializers/post.serializer";
import { History } from 'src/entities/history.entity'
import { User } from "src/entities/user.entity";
import { ParseIntOrNullPipe } from "src/utils/parse_int_or_null.pipe";
import { RecordService } from "src/services/record.service";
import { RecordsCount, UserRecordsService } from "src/services/user_records.service";
import { CurrentUser } from "src/auth/decorators";
import { StatusType } from "src/entities/status_type";
import { Record } from "src/entities/record.entity";
import { RecordSerializer, RecordSerializerOptions } from "src/serializers/record.serializer";

type GetWithCountsResponse = {
  data: RecordDTO[];
  counts: RecordsCount;
}

@Controller('/api/v4/users/:name/records')
export class UserRecordsController {
  constructor(
    private userRecordsService: UserRecordsService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Record) private recordRepository: Repository<Record>,
    private recordSerializer: RecordSerializer,
  ) {}

  @Get()
  async get(
    @Param('name') name: string,
    @CurrentUser({ required: false }) currentUser: User | null,
    @Query('include_has_newer_episode', new DefaultValuePipe('false'), new ParseBoolPipe()) includeHasNewerEpisodeParam: boolean,
    @Query('status_type') statusTypeParam: string | null,
    @Query('category_id', new ParseIntOrNullPipe()) categoryIdParam: number | null,
    @Query('sort') sort: string | null,
    @Query('limit', new ParseIntOrNullPipe()) limit: number | null,
    @Query('with_counts', new DefaultValuePipe('false'), new ParseBoolPipe()) withCounts: boolean,
    @Query('options') optionsJson: string | null,
  ): Promise<RecordDTO[] | GetWithCountsResponse> {
    const user = await this.userRepository.findOne({ where: {username: name} })
    if (!user) throw ApiException.notFound()
    const includeHasNewerEpisode = includeHasNewerEpisodeParam && currentUser?.id === user.id
    let statusType: StatusType | null = null
    if (statusTypeParam != null && statusTypeParam !== '') {
      statusType = StatusType[statusTypeParam.toUpperCase() as keyof typeof StatusType]
    }
    const records = await this.recordRepository.find({
      where: {
        user,
        ...statusType != null ? { status_type: statusType } : {},
        ...categoryIdParam != null ? {
          category_id: categoryIdParam !== 0 ? categoryIdParam : null
        } : {},
      },
      order: sort === 'title' ? { title: 'ASC' } :
        sort === 'rating' ? { rating: 'DESC', updated_at: 'DESC' } :
        /* sort === 'date' || !sort */ { updated_at: 'DESC' },
      ...limit ? { take: limit } : {},
    })
    const options: RecordSerializerOptions =
      optionsJson ? JSON.parse(optionsJson) : RecordSerializer.legacyOptions({
        includeHasNewerEpisode,
      })
    const data = await Promise.all(records.map(it => this.recordSerializer.serialize(it, options)))
    if (!withCounts) {
      return data
    }
    return {
      data,
      counts: await this.userRecordsService.count(user, statusType, categoryIdParam),
    }
  }
}
