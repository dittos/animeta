import { Work } from "src/entities/work.entity";
import { db } from "src/database";
import { AdminWorkDto } from "src/schemas/admin";
import { serializeAdminWork } from "src/serializers/adminWork";
import { mergeWork } from "src/services/work";

export default async function(params: {
  workId: string;
  otherWorkId: string;
  forceMerge: boolean;
}): Promise<AdminWorkDto> {
  return await db.transaction(async () => {
    const work = await db.findOneOrFail(Work, params.workId)
    const other = await db.findOneOrFail(Work, params.otherWorkId)
    await mergeWork(work, other, params.forceMerge)
    return serializeAdminWork(work)
  })
}
