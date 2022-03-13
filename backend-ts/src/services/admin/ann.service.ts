import { Injectable } from "@nestjs/common";
import { Work } from "src/entities/work.entity";
import { EntityManager, Repository } from "typeorm";
import $, * as cheerio from 'cheerio';
import { LATEST_WORK_METADATA_VERSION, Schedule, WorkMetadata } from "src/entities/work_metadata";
import { Temporal } from '@js-temporal/polyfill'
import { Company } from "src/entities/company.entity";
import { WorkService } from "../work.service";
import { InjectRepository } from "@nestjs/typeorm";
import { CompanyAnnIds } from "src/entities/company_ann_ids.entity";
import { WorkStaff } from "src/entities/work_staff.entity";
import { WorkCast } from "src/entities/work_cast.entity";
import { Person } from "src/entities/person.entity";

@Injectable()
export class AnnService {
  constructor(
    private workService: WorkService,
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @InjectRepository(CompanyAnnIds) private companyAnnIdsRepository: Repository<CompanyAnnIds>,
    @InjectRepository(WorkStaff) private workStaffRepository: Repository<WorkStaff>,
    @InjectRepository(WorkCast) private workCastRepository: Repository<WorkCast>,
    @InjectRepository(Person) private personRepository: Repository<Person>,
  ) {}

  async importMetadata(em: EntityManager, work: Work, anime: cheerio.Cheerio<cheerio.Element>) {
    const metadata: WorkMetadata = work.metadata ?? {version: LATEST_WORK_METADATA_VERSION}
    const durationMinutes = metadata.durationMinutes ?? getDurationMinutes(anime)
    const schedules = { ...getSchedules(anime), ...metadata.schedules }
    const website = metadata.website ??
      anime.find('info[type="Official website"][lang="JA"]')
        .toArray()
        .map(el => $(el).attr('href') ?? '')
        .find(it => !it.includes('twitter.com')) ?? null
    const studios = metadata.studios ?? await this.getStudios(anime)
    await this.workService.applyMetadata(em, work, {
      ...metadata,
      durationMinutes,
      schedules,
      website,
      studios,
    })

    const staffsByGid = new Map((await this.workStaffRepository.find({where: {work_id: work.id}}))
      .map(it => [(it.metadata as any)?.annGid, it]))
    const castsByGid = new Map((await this.workCastRepository.find({where: {work_id: work.id}}))
      .map(it => [(it.metadata as any)?.annGid, it]))
    const staffs = await Promise.all(anime.find('staff').toArray().map(async (staffEl, index) => {
      const $staffEl = $(staffEl)
      const personEl = $staffEl.find('person').first()
      const person = await this.getOrCreatePerson(
        personEl.text().trim(),
        Number(personEl.attr('id'))
      )
      const gid = $staffEl.attr('gid')
      let staff = staffsByGid.get(gid)
      if (staff) return staff
      staff = new WorkStaff()
      staff.work_id = work.id
      staff.task = $staffEl.find('task').first().text()
      staff.position = index
      staff.person = person
      staff.metadata = {annGid: gid}
      return staff
    }))
    await this.workStaffRepository.save(staffs)

    if (!anime.find('cast').toArray().every(it => it.attribs['lang'])) throw new Error()
    const casts = await Promise.all(anime.find('cast[lang="JA"]').toArray().map(async (castEl, index) => {
      const $castEl = $(castEl)
      const personEl = $castEl.find('person').first()
      const person = await this.getOrCreatePerson(
        personEl.text().trim(),
        Number(personEl.attr('id'))
      )
      const gid = $castEl.attr('gid')
      let cast = castsByGid.get(gid)
      if (cast) return cast
      cast = new WorkCast()
      cast.work_id = work.id
      cast.role = $castEl.find('role').first().text()
      cast.position = index
      cast.actor = person
      cast.metadata = {annGid: gid}
      return cast
    }))
    await this.workCastRepository.save(casts)
  }

  private async getStudios(anime: cheerio.Cheerio<cheerio.Element>): Promise<string[] | null> {
    const companyEls = anime.find('credit')
      .filter((_, el) => $(el).find('task').text() == 'Animation Production')
      .map((_, el) => $(el).find('company'))
      .filter((_, el) => el.length > 0)
      .toArray()
    if (!companyEls.length) return null
    return await Promise.all(companyEls.map(async it => {
      const annId = Number(it.attr('id'))
      const annName = it.text()
      return (await this.getOrCreateCompany(annName, annId)).name
    }))
  }

  private async getOrCreatePerson(name: string, annId: number): Promise<Company> {
    const existingByAnnId = await this.personRepository.findOne({where: {ann_id: annId}})
    if (existingByAnnId) return existingByAnnId
    const person = new Person()
    person.name = name
    person.metadata = {name_en: name}
    person.ann_id = annId
    return await this.personRepository.save(person)
  }

  private async getOrCreateCompany(name: string, annId: number): Promise<Company> {
    const existingByAnnId = await this.companyRepository.createQueryBuilder('c')
      .leftJoin(CompanyAnnIds, 'cai', 'cai.company_id = c.id')
      .where('cai.ann_ids = :annId', {annId})
      .getOne()
    if (existingByAnnId) return existingByAnnId
    const existingByName = await this.companyRepository.findOne({where: {name}})
    if (existingByName) return existingByName
    const company = new Company()
    company.name = name
    company.metadata = null
    company.ann_id = annId
    await this.companyRepository.save(company)
    const cai = new CompanyAnnIds()
    cai.company_id = company.id
    cai.ann_ids = annId
    await this.companyAnnIdsRepository.save(cai)
    return company
  }
}

function getDurationMinutes(anime: cheerio.Cheerio<cheerio.Element>): number | null {
  const els = anime.find('info[type="Running time"]')
  if (!els.length) return null
  const text = els.first().text()
  if (!/^[0-9]+$/.test(text)) return null
  const result = Number(text)
  return result < 20 ? result : null
}

function getSchedules(anime: cheerio.Cheerio<cheerio.Element>): {[country: string]: Schedule} {
  const els = anime.find('info[type="Vintage"]')
  if (!els.length) return {}
  const s = els.first().text()
  let schedule: Schedule | null = null
  let m = /^\d{4}-\d{2}-\d{2}/.exec(s)
  if (m) {
    schedule = {
      date: Temporal.PlainDate.from(m[0]).toPlainDateTime().toString(),
      datePrecision: 'DATE',
      broadcasts: null,
    }
  } else if (m = /^\d{4}-\d{2}/.exec(s)) {
    schedule = {
      date: Temporal.PlainYearMonth.from(m[0]).toPlainDate({ day: 1 }).toPlainDateTime().toString(),
      datePrecision: 'YEAR_MONTH',
      broadcasts: null,
    }
  }
  if (!schedule) return {}
  return {'jp': schedule}
}
