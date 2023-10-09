import { ApiException } from "src/exceptions";
import { Company } from "src/entities/company.entity";
import { db } from "src/database";
import { CompanyDto } from "src/schemas/admin";
import { serializeCompany } from "src/serializers/company";
import { renameCompany } from "src/services/admin/company";

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
