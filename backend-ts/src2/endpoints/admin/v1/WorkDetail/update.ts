import { Work } from "src/entities/work.entity";
import { db } from "src2/database";
import { AdminWorkDto } from "src2/schemas/admin_raw";
import { serializeAdminWork } from "src2/serializers/adminWork";

export default async function(params: {
  workId: string;
  blacklisted?: boolean;
  imageCenterY?: number;
}): Promise<AdminWorkDto> {
  return await db.transaction(async () => {
    const work = await db.findOneOrFail(Work, params.workId)
    if (params.blacklisted != null) {
      work.blacklisted = params.blacklisted
    }
    if (params.imageCenterY != null) {
      work.image_center_y = params.imageCenterY
    }
    await db.save(work)
    return serializeAdminWork(work)
  })
}
