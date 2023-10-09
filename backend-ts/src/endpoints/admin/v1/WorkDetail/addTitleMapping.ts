import { Work } from "src/entities/work.entity";
import { db } from "src/database";
import { AdminWorkDto } from "src/schemas/admin";
import { serializeAdminWork } from "src/serializers/adminWork";
import { addTitleMapping } from "src/services/work";

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
