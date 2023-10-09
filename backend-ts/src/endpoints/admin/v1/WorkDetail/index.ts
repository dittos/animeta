import { Work } from "src/entities/work.entity";
import { db } from "src/database";
import { AdminWorkDto } from "src/schemas/admin";
import { serializeAdminWork } from "src/serializers/adminWork";

export default async function(params: {
  id: string;
}): Promise<AdminWorkDto> {
  const work = await db.findOneOrFail(Work, params.id)
  return serializeAdminWork(work)
}
