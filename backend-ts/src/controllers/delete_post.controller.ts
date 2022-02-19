import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { RecordDTO } from 'shared/types';
import { CurrentUser } from "src/auth/decorators";
import { History } from "src/entities/history.entity";
import { User } from "src/entities/user.entity";
import { RecordSerializer, RecordSerializerOptions } from "src/serializers/record.serializer";
import { Connection } from "typeorm";
import { ApiException } from "./exceptions";

type Params = {
  id: number;
  recordOptions?: RecordSerializerOptions;
}

type Result = {
  record: RecordDTO | null;
}

@Controller('/api/v4/DeletePost')
export class DeletePostController {
  constructor(
    private connection: Connection,
    private recordSerializer: RecordSerializer,
  ) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Body() params: Params,
    @CurrentUser() currentUser: User,
  ): Promise<Result> {
    const updatedRecord = await this.connection.transaction(async em => {
      const history = await em.findOne(History, params.id, {relations: ['record']})
      if (!history)
        throw ApiException.notFound()
      if (currentUser.id !== history.user_id)
        throw ApiException.permissionDenied()
      const record = history.record
      if (await em.count(History, { where: { record } }) === 1)
        throw new ApiException('등록된 작품마다 최소 1개의 기록이 필요합니다.', HttpStatus.UNPROCESSABLE_ENTITY)
      await em.remove(history)

      const latestHistory = (await em.find(History, {
        where: {record},
        order: {id: 'DESC'},
        take: 1,
      }))[0]
      record.status = latestHistory.status
      record.status_type = latestHistory.status_type
      await em.save(record)

      return record
    })

    return {
      record: params.recordOptions ? await this.recordSerializer.serialize(updatedRecord, params.recordOptions) : null,
    }
  }
}
