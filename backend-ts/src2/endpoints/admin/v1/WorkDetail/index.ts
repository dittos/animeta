import { Work } from "src/entities/work.entity";
import { db } from "src2/database";
import { AdminWorkDto } from "src2/schemas/admin_raw";
import { serializeAdminWork } from "src2/serializers/adminWork";

export default async function(params: {
  id: string;
}): Promise<AdminWorkDto> {
  const work = await db.findOneOrFail(Work, params.id)
  return serializeAdminWork(work)
}
