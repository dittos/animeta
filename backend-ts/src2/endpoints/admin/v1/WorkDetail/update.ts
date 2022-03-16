import { Type } from "@sinclair/typebox";
import { Work } from "src/entities/work.entity";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";

const Params = Type.Object({
  workId: Type.String(),
  blacklisted: Type.Optional(Type.Boolean()),
  imageCenterY: Type.Optional(Type.Number()),
})

const Result = AdminWorkDto

export default createEndpoint(Params, Result, async (params) => {
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
})
