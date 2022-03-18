import { Work } from "src/entities/work.entity";
import $, * as cheerio from 'cheerio';
import got from 'got';
import { LATEST_WORK_METADATA_VERSION, Schedule, WorkMetadata } from "src/entities/work_metadata";
import { Temporal } from '@js-temporal/polyfill'
import { Company } from "src/entities/company.entity";
import { CompanyAnnIds } from "src/entities/company_ann_ids.entity";
import { WorkStaff } from "src/entities/work_staff.entity";
import { WorkCast } from "src/entities/work_cast.entity";
import { Person } from "src/entities/person.entity";
import { applyWorkMetadata } from "src/services/work.service";
import { db } from "src2/database";

export async function getAnnMetadata(annId: string): Promise<cheerio.Cheerio<cheerio.Element>> {
  const response = await got.get(`https://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=${annId}`).text()
  const doc = cheerio.load(response)
  return doc('anime').first()
}

export async function importAnnMetadata(work: Work, anime: cheerio.Cheerio<cheerio.Element>) {
  const metadata: WorkMetadata = work.metadata ?? {version: LATEST_WORK_METADATA_VERSION}
  const durationMinutes = metadata.durationMinutes ?? getDurationMinutes(anime)
  const schedules = { ...getSchedules(anime), ...metadata.schedules }
  const website = metadata.website ??
    anime.find('info[type="Official website"][lang="JA"]')
      .toArray()
      .map(el => $(el).attr('href') ?? '')
      .find(it => !it.includes('twitter.com')) ?? null
  const studios = metadata.studios ?? await getStudios(anime)
  await applyWorkMetadata(db, work, {
    ...metadata,
    durationMinutes,
    schedules,
    website,
    studios,
  })

  const staffsByGid = new Map((await db.find(WorkStaff, {where: {work_id: work.id}}))
    .map(it => [(it.metadata as any)?.annGid, it]))
  const castsByGid = new Map((await db.find(WorkCast, {where: {work_id: work.id}}))
    .map(it => [(it.metadata as any)?.annGid, it]))
  const staffs = await Promise.all(anime.find('staff').toArray().map(async (staffEl, index) => {
    const $staffEl = $(staffEl)
    const personEl = $staffEl.find('person').first()
    const person = await getOrCreatePerson(
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
  await db.save(staffs)

  if (!anime.find('cast').toArray().every(it => it.attribs['lang'])) throw new Error()
  const casts = await Promise.all(anime.find('cast[lang="JA"]').toArray().map(async (castEl, index) => {
    const $castEl = $(castEl)
    const personEl = $castEl.find('person').first()
    const person = await getOrCreatePerson(
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
  await db.save(casts)
}

async function getStudios(anime: cheerio.Cheerio<cheerio.Element>): Promise<string[] | null> {
  const companyEls = anime.find('credit')
    .filter((_, el) => $(el).find('task').text() == 'Animation Production')
    .map((_, el) => $(el).find('company'))
    .filter((_, el) => el.length > 0)
    .toArray()
  if (!companyEls.length) return null
  return await Promise.all(companyEls.map(async it => {
    const annId = Number(it.attr('id'))
    const annName = it.text()
    return (await getOrCreateCompany(annName, annId)).name
  }))
}

async function getOrCreatePerson(name: string, annId: number): Promise<Person> {
  const existingByAnnId = await db.findOne(Person, {where: {ann_id: annId}})
  if (existingByAnnId) return existingByAnnId
  const person = new Person()
  person.name = name
  person.metadata = {name_en: name}
  person.ann_id = annId
  return await db.save(person)
}

async function getOrCreateCompany(name: string, annId: number): Promise<Company> {
  const existingByAnnId = await db.createQueryBuilder(Company, 'c')
    .leftJoin(CompanyAnnIds, 'cai', 'cai.company_id = c.id')
    .where('cai.ann_ids = :annId', {annId})
    .getOne()
  if (existingByAnnId) return existingByAnnId
  const existingByName = await db.findOne(Company, {where: {name}})
  if (existingByName) return existingByName
  const company = new Company()
  company.name = name
  company.metadata = null
  company.ann_id = annId
  await db.save(company)
  const cai = new CompanyAnnIds()
  cai.company_id = company.id
  cai.ann_ids = annId
  await db.save(cai)
  return company
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
