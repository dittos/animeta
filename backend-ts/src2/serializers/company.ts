import { Company } from "src/entities/company.entity";
import { WorkCompany } from "src/entities/work_company.entity";
import { db } from "src2/database";
import { CompanyDto } from "src2/schemas/admin";

export async function serializeCompany(company: Company, includeWorks: boolean = true): Promise<CompanyDto> {
  return {
    id: company.id.toString(),
    name: company.name,
    works: includeWorks ? (await db.find(WorkCompany, {where: {company}, relations: ['work']})).map(it => ({
      id: it.work.id.toString(),
      title: it.work.title,
    })) : undefined,
  }
}
