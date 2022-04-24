import { Work } from "src/entities/work.entity";
import { db } from "src2/database";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";
import { addTitleMapping } from "src2/services/work";

export default async function(params: {
  workId: string;
  title: string;
}): Promise<AdminWorkDto> {
  return db.transaction(async () => {
    const work = await db.findOneOrFail(Work, params.workId)
    await addTitleMapping(work, params.title)
    return serializeAdminWork(work)
  })
}
