import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { RecordDTO } from 'shared/types';
import { ApiException } from "./exceptions";
import { RecordService } from "src/services/record.service";
import { RecordSerializer, RecordSerializerOptions } from "src/serializers/record.serializer";

@Controller('/api/v4/records/:id')
export class RecordController {
  constructor(
    private recordService: RecordService,
    private recordSerializer: RecordSerializer,
  ) {}

  @Get()
  async get(
    @Param('id', new ParseIntPipe()) id: number,
    @Query('options', new DefaultValuePipe('{}')) optionsJson: string,
  ): Promise<RecordDTO> {
    const record = await this.recordService.get(id)
    if (!record) throw ApiException.notFound()
    const options: RecordSerializerOptions = JSON.parse(optionsJson)
    return this.recordSerializer.serialize(record, options)
  }
}
