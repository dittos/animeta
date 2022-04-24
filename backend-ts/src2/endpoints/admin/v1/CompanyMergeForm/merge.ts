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
  otherCompanyId: string;
}): Promise<CompanyDto> {
  return db.transaction(async () => {
    const company = await db.findOne(Company, params.id)
    if (!company) throw ApiException.notFound()
    const other = await db.findOne(Company, params.otherCompanyId)
    if (!other) throw ApiException.notFound()
    if (company.id === other.id)
      throw new ApiException('Cannot merge itself', HttpStatus.BAD_REQUEST)

    const otherWorks = await db.find(WorkCompany, {where: {company: other}, relations: ['work', 'company']})
    if (otherWorks.some(it => it.company.id === company.id))
      throw new ApiException('Works with conflict exists', HttpStatus.BAD_REQUEST)

    for (const workCompany of otherWorks) {
      const work = workCompany.work!
      const metadata = work.metadata ?? {version: LATEST_WORK_METADATA_VERSION}
      await applyWorkMetadata(work, {
        ...metadata,
        studios: metadata.studios?.map(it => it === other.name ? company.name : it),
      })
    }
    await db.remove(other)

    return serializeCompany(company)
  })
}
