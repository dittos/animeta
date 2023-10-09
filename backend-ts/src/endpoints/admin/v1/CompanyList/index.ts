import { Company } from "src/entities/company.entity";
import { db } from "src/database";
import { CompanyDto } from "src/schemas/admin";
import { serializeCompany } from "src/serializers/company";

export default async function(_params: {}): Promise<CompanyDto[]> {
  const companies = await db.find(Company, {order: {name: 'ASC'}})
  return Promise.all(companies.map(it => serializeCompany(it, false)))
}
