import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RecordDTO } from 'shared/types';
import { CurrentUser } from "src/auth/decorators";
import { Category } from "src/entities/category.entity";
import { User } from "src/entities/user.entity";
import { RecordSerializer, RecordSerializerOptions } from "src/serializers/record.serializer";
import { RecordService } from "src/services/record.service";
import { WorkService } from "src/services/work.service";
import { Connection, Repository } from "typeorm";
import { ApiException } from "./exceptions";

type Params = {
  id: number;
  title?: string | null;
  categoryId?: number | null;
  categoryIdIsSet?: boolean;
  rating?: number | null;
  ratingIsSet?: boolean;
  options?: RecordSerializerOptions;
}

type Result = {
  record: RecordDTO | null;
}

@Controller('/api/v4/UpdateRecord')
export class UpdateRecordController {
  constructor(
    private connection: Connection,
    private recordSerializer: RecordSerializer,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    private recordService: RecordService,
    private workService: WorkService,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Body() params: Params,
    @CurrentUser() currentUser: User,
  ): Promise<Result> {
    const record = await this.recordService.get(params.id)
    if (!record)
      throw ApiException.notFound()
    if (currentUser.id !== record.user_id)
      throw ApiException.permissionDenied()

    if (params.title != null) {
      const work = await this.workService.getOrCreate(params.title)
      await this.connection.transaction(async em =>
        this.recordService.updateRecordWorkAndTitle(em, record, work, params.title!)
      )
    }

    if (params.categoryIdIsSet) {
      let category: Category | null
      if (params.categoryId != null) {
        category = await this.categoryRepository.findOne(params.categoryId) ?? null
        if (category?.user_id !== record.user_id)
          throw ApiException.permissionDenied()
      } else {
        category = null
      }
      await this.recordService.updateCategory(record, category)
    }

    if (params.ratingIsSet) {
      await this.recordService.updateRating(record, params.rating ?? null)
    }

    return {
      record: params.options ? await this.recordSerializer.serialize(record, params.options) : null,
    }
  }
}
