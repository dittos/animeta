import { HttpStatus } from "@nestjs/common";
import { ApiException } from "src/controllers/exceptions";
import { Company } from "src/entities/company.entity";
import { WorkCompany } from "src/entities/work_company.entity";
import { LATEST_WORK_METADATA_VERSION } from "src/entities/work_metadata";
import { applyWorkMetadata } from "src2/services/work";
import { db } from "src2/database";
import { CompanyDto } from "src2/schemas/admin";
import { serializeCompany } from "src2/serializers/company";

export default async function(params: {
  id: string;
  name: string;
}): Promise<CompanyDto> {
  return db.transaction(async () => {
    const company = await db.findOne(Company, params.id)
    if (!company) throw ApiException.notFound()
    if (company.name !== params.name) {
      if (await db.findOne(Company, {where: {name: params.name}}))
        throw new ApiException('Name collsion', HttpStatus.BAD_REQUEST)
      
      const prevName = company.name
      company.name = params.name
      await db.save(company)

      for (const workCompany of await db.find(WorkCompany, {where: {company}, relations: ['work']})) {
        const work = workCompany.work!
        const metadata = work.metadata ?? {version: LATEST_WORK_METADATA_VERSION}
        await applyWorkMetadata(work, {
          ...metadata,
          studios: metadata.studios?.map(it => it === prevName ? company.name : it),
        })
      }
    }
    return serializeCompany(company)
  })
}
