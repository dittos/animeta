import { Work } from "src/entities/work.entity";
import { db } from "src/database";
import { AdminWorkDto } from "src/schemas/admin";
import { serializeAdminWork } from "src/serializers/adminWork";
import { setPrimaryTitleMapping } from "src/services/work";

export default async function(params: {
  workId: string;
  primaryTitleMappingId: string;
}): Promise<AdminWorkDto> {
  const work = await db.findOneOrFail(Work, params.workId)
  await setPrimaryTitleMapping(work, params.primaryTitleMappingId)
  return serializeAdminWork(work)
}
