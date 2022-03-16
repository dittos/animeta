import { HttpStatus } from "@nestjs/common";
import { Type } from "@sinclair/typebox";
import { ApiException } from "src/controllers/exceptions";
import { TitleMapping } from "src/entities/title_mapping.entity";
import { Work } from "src/entities/work.entity";
import { normalizeTitle } from "src/services/work.service";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";
import { Not } from "typeorm";

const Params = Type.Object({
  workId: Type.String(),
  title: Type.String(),
})

const Result = AdminWorkDto

export default createEndpoint(Params, Result, (params) => db.transaction(async () => {
  const work = await db.findOneOrFail(Work, params.workId)
  const title = params.title.trim()
  const key = normalizeTitle(title)
  if (await db.findOne(TitleMapping, {where: {key, work_id: Not(work.id)}})) {
    throw new ApiException('Title already mapped', HttpStatus.FORBIDDEN)
  }
  const mapping = new TitleMapping()
  mapping.work_id = work.id
  mapping.title = title
  mapping.key = key
  db.save(mapping)
  await db.save(work)
  return serializeAdminWork(work)
}))
