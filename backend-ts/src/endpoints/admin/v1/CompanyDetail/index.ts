import { ApiException } from "src/exceptions";
import { Company } from "src/entities/company.entity";
import { db } from "src/database";
import { CompanyDto } from "src/schemas/admin";
import { serializeCompany } from "src/serializers/company";

export default async function(params: {id: string}): Promise<CompanyDto> {
  const company = await db.findOne(Company, params.id)
  if (!company) throw ApiException.notFound()
  return serializeCompany(company)
}
