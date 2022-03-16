import { Type } from "@sinclair/typebox";
import { getOrCreateWork } from "src/services/work.service";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";

export const Params = Type.Object({
  title: Type.String(),
})

export const Result = AdminWorkDto

export default createEndpoint(Params, Result, async (params) => {
  const work = await getOrCreateWork(db, params.title)
  return serializeAdminWork(work)
})
