import { Work } from "src/entities/work.entity";
import { applyWorkMetadataRaw } from "src2/services/work";
import { db } from "src2/database";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";

export default async function(params: {
  workId: string;
  rawMetadata: string;
}): Promise<AdminWorkDto> {
  return await db.transaction(async () => {
    const work = await db.findOneOrFail(Work, params.workId)
    await applyWorkMetadataRaw(work, params.rawMetadata)
    return serializeAdminWork(work)
  })
}
