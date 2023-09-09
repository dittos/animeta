import { ApiException } from "src2/exceptions";
import { Company } from "src/entities/company.entity";
import { db } from "src2/database";
import { CompanyDto } from "src2/schemas/admin";
import { serializeCompany } from "src2/serializers/company";

export default async function(params: {id: string}): Promise<CompanyDto> {
  const company = await db.findOne(Company, params.id)
  if (!company) throw ApiException.notFound()
  return serializeCompany(company)
}
