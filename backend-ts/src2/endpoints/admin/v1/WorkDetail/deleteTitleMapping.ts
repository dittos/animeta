import { Work } from "src/entities/work.entity";
import { db } from "src2/database";
import { deleteTitleMapping } from "src2/services/work";

export default async function(params: {
  workId: string;
  titleMappingId: string;
}): Promise<boolean> {
  return db.transaction(async () => {
    const work = await db.findOneOrFail(Work, params.workId)
    await deleteTitleMapping(work, params.titleMappingId)
    return true
  })
}
