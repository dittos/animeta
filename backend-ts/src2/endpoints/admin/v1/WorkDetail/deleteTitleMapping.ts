import { HttpStatus } from "@nestjs/common";
import { ApiException } from "src/controllers/exceptions";
import { Record } from "src/entities/record.entity";
import { TitleMapping } from "src/entities/title_mapping.entity";
import { db } from "src2/database";

export default async function(params: {titleMappingId: string}): Promise<boolean> {
  return db.transaction(async () => {
    const mapping = await db.findOneOrFail(TitleMapping, params.titleMappingId)
    if (await db.findOne(Record, {where: {title: mapping.title}})) {
      throw new ApiException("Record exists", HttpStatus.FORBIDDEN)
    }
    await db.remove(mapping)
    return true
  })
}
