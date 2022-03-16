import { Type } from "@sinclair/typebox";
import { TitleMapping } from "src/entities/title_mapping.entity";
import { Work } from "src/entities/work.entity";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";

const Params = Type.Object({
  workId: Type.String(),
  primaryTitleMappingId: Type.String(),
})

const Result = AdminWorkDto

export default createEndpoint(Params, Result, async (params) => {
  const mapping = await db.findOneOrFail(TitleMapping, params.primaryTitleMappingId)
  const work = await db.findOneOrFail(Work, mapping.work_id)
  work.title = mapping.title
  await db.save(work)
  return serializeAdminWork(work)
})
