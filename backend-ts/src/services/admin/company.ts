import { Company } from "src/entities/company.entity";
import { CompanyAnnIds } from "src/entities/company_ann_ids.entity";
import { WorkCompany } from "src/entities/work_company.entity";
import { LATEST_WORK_METADATA_VERSION } from "src/entities/work_metadata";
import { ValidationError } from "src/services/exceptions";
import { db } from "src/database";
import { applyWorkMetadata } from "../work";

export async function getOrCreateCompany(name: string, annId?: number): Promise<Company> {
  if (annId) {
    const existingByAnnId = await db.createQueryBuilder(Company, 'c')
      .leftJoin(CompanyAnnIds, 'cai', 'cai.company_id = c.id')
      .where('cai.ann_ids = :annId', {annId})
      .getOne()
    if (existingByAnnId) return existingByAnnId
  }
  const existingByName = await db.findOne(Company, {where: {name}})
  if (existingByName) return existingByName
  const company = new Company()
  company.name = name
  company.metadata = null
  company.ann_id = annId ?? null
  await db.save(company)
  if (annId) {
    const cai = new CompanyAnnIds()
    cai.company_id = company.id
    cai.ann_ids = annId
    await db.save(cai)
  }
  return company
}

export async function mergeCompany(company: Company, other: Company) {
  if (company.id === other.id)
    throw new ValidationError('Cannot merge itself')

  const otherWorks = await db.find(WorkCompany, {where: {company: other}, relations: ['work', 'company']})
  if (otherWorks.some(it => it.company.id === company.id))
    throw new ValidationError('Works with conflict exists')

  for (const workCompany of otherWorks) {
    const work = workCompany.work!
    const metadata = work.metadata ?? {version: LATEST_WORK_METADATA_VERSION}
    await applyWorkMetadata(work, {
      ...metadata,
      studios: metadata.studios?.map(it => it === other.name ? company.name : it),
    })
  }

  await db.update(CompanyAnnIds, /* where */ {company_id: other.id}, /* updates */ {company_id: company.id})
  
  await db.remove(other)
}

export async function renameCompany(company: Company, name: string) {
  name = name.trim()
  if (name === '')
    throw new ValidationError('Empty name is not allowed')

  if (company.name === name)
    return;

  if (await db.findOne(Company, {where: {name}}))
    throw new ValidationError('Name collsion')

  const prevName = company.name
  company.name = name
  await db.save(company)

  for (const workCompany of await db.find(WorkCompany, {where: {company}, relations: ['work']})) {
    const work = workCompany.work!
    const metadata = work.metadata ?? {version: LATEST_WORK_METADATA_VERSION}
    await applyWorkMetadata(work, {
      ...metadata,
      studios: metadata.studios?.map(it => it === prevName ? company.name : it),
    })
  }
}
