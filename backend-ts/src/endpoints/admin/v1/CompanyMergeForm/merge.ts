import { ApiException } from "src/exceptions";
import { Company } from "src/entities/company.entity";
import { db } from "src/database";
import { CompanyDto } from "src/schemas/admin";
import { serializeCompany } from "src/serializers/company";
import { mergeCompany } from "src/services/admin/company";

export default async function(params: {
  id: string;
  otherCompanyId: string;
}): Promise<CompanyDto> {
  return db.transaction(async () => {
    const company = await db.findOne(Company, params.id)
    if (!company) throw ApiException.notFound()
    const other = await db.findOne(Company, params.otherCompanyId)
    if (!other) throw ApiException.notFound()
    await mergeCompany(company, other)
    return serializeCompany(company)
  })
}
