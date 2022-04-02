import { getOrCreateWork } from "src/services/work.service";
import { db } from "src2/database";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";

export default async function(params: {title: string}): Promise<AdminWorkDto> {
  const work = await getOrCreateWork(db, params.title)
  return serializeAdminWork(work)
}
