import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators";
import { User } from "src/entities/user.entity";
import { ApiException } from "./exceptions";
import { WorkService } from "src/services/work.service";
import { WorkSerializer } from "src/serializers/work.serializer";
import { WorkDTO } from "shared/types";

@Controller('/api/v4/works/:id([0-9]+)')
export class WorkController {
  constructor(
    private workService: WorkService,
    private workSerializer: WorkSerializer,
  ) {}

  @Get()
  async get(
    @Param('id', new ParseIntPipe()) id: number,
    @CurrentUser({ required: false }) currentUser: User | null,
  ): Promise<WorkDTO> {
    const work = await this.workService.get(id)
    if (!work) throw ApiException.notFound()
    return this.workSerializer.serialize(work, currentUser, true)
  }
}
