import { ApiException } from "src2/exceptions";
import { Company } from "src/entities/company.entity";
import { db } from "src2/database";
import { CompanyDto } from "src2/schemas/admin";
import { serializeCompany } from "src2/serializers/company";
import { renameCompany } from "src2/services/admin/company";

export default async function(params: {
  id: string;
  name: string;
}): Promise<CompanyDto> {
  return db.transaction(async () => {
    const company = await db.findOne(Company, params.id)
    if (!company) throw ApiException.notFound()
    await renameCompany(company, params.name)
    return serializeCompany(company)
  })
}
