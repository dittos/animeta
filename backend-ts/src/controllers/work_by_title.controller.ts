import { Controller, Get, Query } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators";
import { User } from "src/entities/user.entity";
import { ApiException } from "./exceptions";
import { WorkService } from "src/services/work.service";
import { WorkSerializer } from "src/serializers/work.serializer";
import { WorkDTO } from "shared/types";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { TitleMapping } from "src/entities/title_mapping.entity";

@Controller('/api/v4/works/by-title')
export class WorkByTitleController {
  constructor(
    private workService: WorkService,
    @InjectRepository(TitleMapping) private titleMappingRepository: Repository<TitleMapping>,
    private workSerializer: WorkSerializer,
  ) {}

  @Get()
  async get(
    @Query('title') title: string,
    @CurrentUser({ required: false }) currentUser: User | null,
  ): Promise<WorkDTO> {
    const titleMapping = await this.titleMappingRepository.findOne({ where: {title} })
    if (!titleMapping) throw ApiException.notFound()
    const work = await this.workService.get(titleMapping.work_id)
    if (!work) throw ApiException.notFound()
    return this.workSerializer.serialize(work, currentUser, true)
  }
}
