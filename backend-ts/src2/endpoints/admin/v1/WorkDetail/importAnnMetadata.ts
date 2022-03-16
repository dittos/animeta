import { Type } from "@sinclair/typebox";
import { Work } from "src/entities/work.entity";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";
import { getAnnMetadata, importAnnMetadata } from "src2/services/admin/ann";

const Params = Type.Object({
  workId: Type.String(),
  annId: Type.String(),
})

const Result = AdminWorkDto

export default createEndpoint(Params, Result, async (params) => {
  const metadata = await getAnnMetadata(params.annId)
  const work = await db.transaction(async () => {
    const work = await db.findOneOrFail(Work, params.workId)
    await importAnnMetadata(work, metadata)
    return await db.save(work)
  })
  return serializeAdminWork(work)
})