import { HttpStatus } from "@nestjs/common";
import { Type } from "@sinclair/typebox";
import { ApiException } from "src/controllers/exceptions";
import { Company } from "src/entities/company.entity";
import { WorkCompany } from "src/entities/work_company.entity";
import { LATEST_WORK_METADATA_VERSION } from "src/entities/work_metadata";
import { applyWorkMetadata } from "src/services/work.service";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";
import { CompanyDto } from "src2/schemas/admin";
import { serializeCompany } from "src2/serializers/company";

const Params = Type.Object({
  id: Type.String(),
  name: Type.String(),
})

const Result = CompanyDto

export default createEndpoint(Params, Result, async (params) => db.transaction(async () => {
  const company = await db.findOne(Company, params.id)
  if (!company) throw ApiException.notFound()
  if (company.name !== params.name) {
    if (await db.findOne(Company, {where: {name: params.name}}))
      throw new ApiException('Name collsion', HttpStatus.BAD_REQUEST)
    
    const prevName = company.name
    company.name = params.name
    await db.save(company)

    for (const workCompany of await db.find(WorkCompany, {where: {company}, relations: ['work']})) {
      const work = workCompany.work
      const metadata = work.metadata ?? {version: LATEST_WORK_METADATA_VERSION}
      await applyWorkMetadata(db, work, {
        ...metadata,
        studios: metadata.studios?.map(it => it === prevName ? company.name : it),
      })
    }
  }
  return serializeCompany(company)
}))
