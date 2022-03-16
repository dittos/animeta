import { Type } from "@sinclair/typebox";
import { Work } from "src/entities/work.entity";
import { applyWorkMetadataRaw } from "src/services/work.service";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";

const Params = Type.Object({
  workId: Type.String(),
  rawMetadata: Type.String(),
})

const Result = AdminWorkDto

export default createEndpoint(Params, Result, async (params) => {
  return await db.transaction(async () => {
    const work = await db.findOneOrFail(Work, params.workId)
    await applyWorkMetadataRaw(db, work, params.rawMetadata)
    return serializeAdminWork(work)
  })
})
