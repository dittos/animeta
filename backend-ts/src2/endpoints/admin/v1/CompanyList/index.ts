import { Company } from "src/entities/company.entity";
import { db } from "src2/database";
import { CompanyDto } from "src2/schemas/admin";
import { serializeCompany } from "src2/serializers/company";

export default async function(_params: {}): Promise<CompanyDto[]> {
  const companies = await db.find(Company, {order: {name: 'ASC'}})
  return Promise.all(companies.map(it => serializeCompany(it, false)))
}
