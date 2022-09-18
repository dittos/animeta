import { Work } from "src/entities/work.entity";
import { db } from "src2/database";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";
import { setPrimaryTitleMapping } from "src2/services/work";

export default async function(params: {
  workId: string;
  primaryTitleMappingId: string;
}): Promise<AdminWorkDto> {
  const work = await db.findOneOrFail(Work, params.workId)
  await setPrimaryTitleMapping(work, params.primaryTitleMappingId)
  return serializeAdminWork(work)
}
