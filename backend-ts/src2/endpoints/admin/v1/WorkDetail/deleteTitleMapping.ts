import { db } from "src2/database";
import { deleteTitleMapping } from "src2/services/work";

export default async function(params: {titleMappingId: string}): Promise<boolean> {
  return db.transaction(async () => {
    await deleteTitleMapping(params.titleMappingId)
    return true
  })
}
