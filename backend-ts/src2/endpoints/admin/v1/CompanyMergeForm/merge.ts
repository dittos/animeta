import { ApiException } from "src2/exceptions";
import { Company } from "src/entities/company.entity";
import { db } from "src2/database";
import { CompanyDto } from "src2/schemas/admin";
import { serializeCompany } from "src2/serializers/company";
import { mergeCompany } from "src2/services/admin/company";

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
