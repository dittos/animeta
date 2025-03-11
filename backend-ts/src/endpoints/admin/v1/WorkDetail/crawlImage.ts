import { Work } from "src/entities/work.entity";
import { db } from "src/database";
import { AdminWorkDto } from "src/schemas/admin";
import { serializeAdminWork } from "src/serializers/adminWork";
import { crawlImage } from "src/services/admin/image";

export default async function(params: {
  workId: string;
  options: {
    source: 'ann';
    annId: string;
  } | {
    source: 'url';
    url: string;
  };
}): Promise<AdminWorkDto> {
  const work = await db.findOneOrFail(Work, params.workId)
  const options = params.options
  await crawlImage(work, options)
  return serializeAdminWork(work)
}
