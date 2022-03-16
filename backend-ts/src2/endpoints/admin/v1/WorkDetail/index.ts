import { Type } from "@sinclair/typebox";
import { Work } from "src/entities/work.entity";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";

const Params = Type.Object({
  id: Type.String(),
})

const Result = AdminWorkDto

export default createEndpoint(Params, Result, async (params) => {
  const work = await db.findOneOrFail(Work, params.id)
  return serializeAdminWork(work)
})
