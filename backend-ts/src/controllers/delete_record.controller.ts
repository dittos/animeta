import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { CurrentUser } from "src/auth/decorators";
import { User } from "src/entities/user.entity";
import { RecordService } from "src/services/record.service";
import { Connection } from "typeorm";
import { ApiException } from "./exceptions";

type Params = {
  id: number;
}

type Result = {
  ok: boolean;
}

@Controller('/api/v4/DeleteRecord')
export class DeleteRecordController {
  constructor(
    private connection: Connection,
    private recordService: RecordService,
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

    await this.connection.transaction(async em =>
      this.recordService.delete(em, record)
    )

    return { ok: true }
  }
}
