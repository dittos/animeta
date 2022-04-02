import { TitleMapping } from "src/entities/title_mapping.entity";
import { Work } from "src/entities/work.entity";
import { db } from "src2/database";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";

export default async function(params: {
  workId: string;
  primaryTitleMappingId: string;
}): Promise<AdminWorkDto> {
  const mapping = await db.findOneOrFail(TitleMapping, params.primaryTitleMappingId)
  const work = await db.findOneOrFail(Work, mapping.work_id)
  work.title = mapping.title
  await db.save(work)
  return serializeAdminWork(work)
}
