import { Company } from "src/entities/company.entity";
import { Work } from "src/entities/work.entity";
import { WorkCompany } from "src/entities/work_company.entity";
import { WorkMetadata } from "src/entities/work_metadata";
import { WorkPeriodIndex } from "src/entities/work_period_index.entity";
import { Period } from "src/utils/period";
import { ValidationError } from "src/services/exceptions";
import { db } from "src2/database";
import { normalizeTitle } from "src/services/work.service";
import { TitleMapping } from "src/entities/title_mapping.entity";
import { Not } from "typeorm";
import { Record } from "src/entities/record.entity";
import { History } from "src/entities/history.entity";
import { WorkTitleIndex } from "src/entities/work_title_index.entity";
import { WorkIndex } from "src/entities/work_index.entity";
import * as DataLoader from "dataloader";
import { objResults, objResultsNullable } from "src/utils/dataloader";
import { Episode } from "src/entities/episode.entity";

const dataLoader = new DataLoader<number, Work>(
  objResults(ids => db.findByIds(Work, Array.from(ids)), k => `${k}`, v => `${v.id}`),
  { cache: false }
);
const indexDataLoader = new DataLoader<number, WorkIndex | undefined>(
  objResultsNullable(ids => db.findByIds(WorkIndex, Array.from(ids)), k => `${k}`, v => `${v.work_id}`),
  { cache: false }
);

export async function getWork(id: number): Promise<Work> {
  return dataLoader.load(id)
}

export async function getWorkByTitle(title: string): Promise<Work | undefined> {
  const titleMapping = await db.findOne(TitleMapping, { where: {title} })
  if (!titleMapping) return undefined
  return await getWork(titleMapping.work_id)
}

export async function getWorkIndex(id: number): Promise<WorkIndex | undefined> {
  return indexDataLoader.load(id)
}

export async function applyWorkMetadataRaw(work: Work, rawMetadata: string) {
  let metadata: WorkMetadata
  try {
    // TODO: validation
    metadata = JSON.parse(rawMetadata || "{}")
    if (metadata.version < 2) {
      throw new Error(`${metadata.version} is outdated metadata version`)
    }
  } catch (e) {
    throw new ValidationError(`Metadata parse failed: ${(e as any)?.message}`)
  }
  return applyWorkMetadata(work, metadata)
}

export async function applyWorkMetadata(work: Work, metadata: WorkMetadata) {
  work.metadata = metadata
  work.raw_metadata = JSON.stringify(metadata)
  const periods = metadata.periods?.map(it => Period.parseOrThrow(it)) ?? []
  await db.delete(WorkPeriodIndex, {work_id: work.id})
  periods.sort()
  await db.save(periods.map((period, index) => {
    const wpi = new WorkPeriodIndex()
    wpi.period = period.toString()
    wpi.work_id = work.id
    wpi.is_first_period = index === 0
    return wpi
  }))
  work.first_period = periods[0]?.toString() ?? null
  const studios = await Promise.all(metadata.studios?.map(async it => {
    let company = await db.findOne(Company, {name: it})
    if (company) return company
    company = new Company()
    company.name = it
    return db.save(company)
  }) ?? [])
  await db.delete(WorkCompany, {work_id: work.id})
  await db.save(studios.map((company, index) => {
    const wc = new WorkCompany()
    wc.work_id = work.id
    wc.position = index
    wc.company = company
    return wc
  }))
  await db.save(work)
}

export async function addTitleMapping(work: Work, title: string) {
  title = title.trim()
  const key = normalizeTitle(title)
  if (await db.findOne(TitleMapping, {where: {key, work_id: Not(work.id)}})) {
    throw new ValidationError('Title already mapped')
  }
  const mapping = new TitleMapping()
  mapping.work_id = work.id
  mapping.title = title
  mapping.key = key
  await db.save(mapping)
  await db.save(work)
}

export async function deleteTitleMapping(titleMappingId: string) {
  const mapping = await db.findOneOrFail(TitleMapping, titleMappingId)
  // TODO: 역할 분리
  if (await db.findOne(Record, {where: {title: mapping.title}})) {
    throw new ValidationError("Record exists")
  }
  await db.remove(mapping)
}

export async function mergeWork(work: Work, other: Work, forceMerge: boolean = false) {
  if (work.id === other.id) {
    throw new ValidationError('Cannot merge itself')
  }
  const conflicts = await db.query(`
    SELECT u.id, u.username, r1.id AS id1, r2.id AS id2
    FROM record_record r1
      JOIN record_record r2 ON r2.user_id = r1.user_id AND r2.work_id = $2
      JOIN auth_user u ON u.id = r1.user_id
    WHERE r1.work_id = $1
  `, [work.id, other.id])
  if (conflicts.length > 0 && !forceMerge) {
    throw new ValidationError("Users with conflict exist", {
      conflicts: conflicts.map((it: any) => ({
        user_id: it.id,
        username: it.username,
        ids: [it.id1, it.id2],
      }))
    })
  }
  for (const conflict of conflicts) {
    if (!conflict.id || !other.id) throw new Error('assertion failed')
    await db.delete(History, {user_id: conflict.id, work_id: other.id})
    await db.delete(Record, {user_id: conflict.id, work_id: other.id})
  }
  await db.update(TitleMapping, /* where */ {work_id: other.id}, /* updates */ {work_id: work.id})
  // TODO: 역할 분리
  await db.update(History, /* where */ {work_id: other.id}, /* updates */ {work_id: work.id})
  await db.update(Record, /* where */ {work_id: other.id}, /* updates */ {work_id: work.id})
  await db.delete(WorkTitleIndex, {work_id: other.id})
  await db.delete(WorkIndex, {work_id: other.id})
  await db.remove(other)
}

export async function getWorkEpisodes(work: Work): Promise<Episode[]> {
  const result = await db.createQueryBuilder()
    .from(History, 'h')
    .select('status')
    .addSelect('COUNT(*)', 'count')
    .where('work_id = :workId AND comment <> :commentNot', { workId: work.id, commentNot: '' })
    .groupBy('status')
    .getRawMany()
  const result2 = await db.createQueryBuilder()
    .from(History, 'h')
    .select('status')
    .addSelect('COUNT(*)', 'count')
    .where('work_id = :workId AND comment = :comment', { workId: work.id, comment: '' })
    .groupBy('status')
    .getRawMany()
  const episodeMap = new Map<number, Episode>()
  for (const { status, count } of result) {
    if (!/^[0-9]+$/.test(status)) continue
    const statusNumber = Number(status)
    episodeMap.set(statusNumber, {
      workId: work.id,
      number: statusNumber,
      postCount: Number(count),
    })
  }
  for (const { status, count } of result2) {
    if (!/^[0-9]+$/.test(status)) continue
    const statusNumber = Number(status)
    const countNumber = Number(count)
    if (!episodeMap.has(statusNumber) && countNumber > 1) {
      episodeMap.set(statusNumber, {
        workId: work.id,
        number: statusNumber,
        postCount: null,
      })
    }
  }
  return Array.from(episodeMap.values()).sort((a, b) => a.number - b.number)
}

export async function getWorkEpisode(work: Work, number: number): Promise<Episode | null> {
  const postCount = await db.count(History, {
    where: {
      work_id: work.id,
      status: number,
      comment: Not(''),
    }
  })
  if (postCount === 0) {
    const historyWithoutCommentCount = await db.count(History, {
      where: {
        work_id: work.id,
        status: number,
        comment: '',
      }
    })
    // status is not counted as episode if no or only one person left
    if (historyWithoutCommentCount < 2) {
      return null
    }
  }
  return {
    workId: work.id,
    number,
    postCount,
  }
}
