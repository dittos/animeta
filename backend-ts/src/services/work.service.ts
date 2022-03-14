import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as DataLoader from "dataloader";
import { Episode } from "shared/types_generated";
import { Company } from "src/entities/company.entity";
import { History } from "src/entities/history.entity";
import { TitleMapping } from "src/entities/title_mapping.entity";
import { Work } from "src/entities/work.entity";
import { WorkCompany } from "src/entities/work_company.entity";
import { WorkIndex } from "src/entities/work_index.entity";
import { WorkMetadata } from "src/entities/work_metadata";
import { WorkPeriodIndex } from "src/entities/work_period_index.entity";
import { objResults } from "src/utils/dataloader";
import { Period } from "src/utils/period";
import { EntityManager, Repository } from "typeorm";
import { ValidationError } from "./exceptions";

@Injectable()
export class WorkService {
  private dataLoader = new DataLoader<number, Work>(
    objResults(ids => this.load(ids), k => `${k}`, v => `${v.id}`),
    { cache: false }
  );
  private indexDataLoader = new DataLoader<number, WorkIndex>(
    objResults(ids => this.loadIndex(ids), k => `${k}`, v => `${v.work_id}`),
    { cache: false }
  );
  
  constructor(
    @InjectRepository(Work) private workRepository: Repository<Work>,
    @InjectRepository(WorkIndex) private workIndexRepository: Repository<WorkIndex>,
    @InjectRepository(TitleMapping) private titleMappingRepository: Repository<TitleMapping>,
    @InjectRepository(History) private historyRepository: Repository<History>,
  ) {}

  get(id: number): Promise<Work> {
    return this.dataLoader.load(id);
  }

  getIndex(id: number): Promise<WorkIndex> {
    return this.indexDataLoader.load(id);
  }

  async getEpisodes(work: Work): Promise<Episode[]> {
    const result = await this.historyRepository.createQueryBuilder()
      .select('status')
      .addSelect('COUNT(*)', 'count')
      .where('work_id = :workId AND comment <> :commentNot', { workId: work.id, commentNot: '' })
      .groupBy('status')
      .getRawMany()
    const result2 = await this.historyRepository.createQueryBuilder()
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
        number: statusNumber,
        post_count: Number(count),
      })
    }
    for (const { status, count } of result2) {
      if (!/^[0-9]+$/.test(status)) continue
      const statusNumber = Number(status)
      const countNumber = Number(count)
      if (!episodeMap.has(statusNumber) && countNumber > 1) {
        episodeMap.set(statusNumber, {
          number: statusNumber,
          post_count: null,
        })
      }
    }
    return Array.from(episodeMap.values()).sort((a, b) => a.number - b.number)
  }

  private async load(ids: readonly number[]): Promise<Work[]> {
    return this.workRepository.findByIds(Array.from(ids));
  }

  private async loadIndex(ids: readonly number[]): Promise<WorkIndex[]> {
    return this.workIndexRepository.findByIds(Array.from(ids));
  }

  getImageUrl(work: Work): string | null {
    // TODO: config
    return work.image_filename ? `https://storage.googleapis.com/animeta-static/media/${work.image_filename}` : null
  }

  async getOrCreate(title: string): Promise<Work> {
    title = title.trim()
    if (title === '')
      throw new ValidationError('작품 제목을 입력하세요.')
    
    const mapping = await this.titleMappingRepository.findOne({ where: {title} })
    if (mapping) {
      return this.workRepository.findOneOrFail(mapping.work_id)
    }
    const key = normalizeTitle(title)
    const similarMapping = await this.titleMappingRepository.findOne({ where: {key} })
    if (similarMapping) {
      await this.titleMappingRepository.save({
        work_id: similarMapping.work_id,
        title,
        key
      })
      return this.workRepository.findOneOrFail(similarMapping.work_id)
    }
    const work = new Work()
    work.title = title
    work.image_center_y = 0.0
    work.blacklisted = false
    await this.workRepository.save(work)
    await this.titleMappingRepository.save({
      work_id: work.id,
      title,
      key,
    })
    return work
  }

  async editMetadata(em: EntityManager, work: Work, rawMetadata: string) {
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
    return this.applyMetadata(em, work, metadata)
  }

  async applyMetadata(em: EntityManager, work: Work, metadata: WorkMetadata) {
    return applyWorkMetadata(em, work, metadata)
  }
}

export async function applyWorkMetadata(em: EntityManager, work: Work, metadata: WorkMetadata) {
  work.metadata = metadata
  work.raw_metadata = JSON.stringify(metadata)
  const periods = metadata.periods?.map(it => Period.parseOrThrow(it)) ?? []
  await em.delete(WorkPeriodIndex, {work_id: work.id})
  periods.sort()
  await em.save(periods.map((period, index) => {
    const wpi = new WorkPeriodIndex()
    wpi.period = period.toString()
    wpi.work_id = work.id
    wpi.is_first_period = index === 0
    return wpi
  }))
  work.first_period = periods[0]?.toString() ?? null
  const studios = await Promise.all(metadata.studios?.map(async it => {
    let company = await em.findOne(Company, {name: it})
    if (company) return company
    company = new Company()
    company.name = it
    return em.save(company)
  }) ?? [])
  await em.delete(WorkCompany, {work_id: work.id})
  await em.save(studios.map((company, index) => {
    const wc = new WorkCompany()
    wc.work_id = work.id
    wc.position = index
    wc.company = company
    return wc
  }))
  await em.save(work)
}

const exceptionChars = ['!', '+']

export function normalizeTitle(title: string): string {
  return Array.from(title)
    .map(c => {
      // full width -> half width
      if ('\uFF01' <= c && c <= '\uFF5E')
        return String.fromCodePoint(c.codePointAt(0)! - 0xFF01 + 0x21)
      else
        return c
    })
    .filter(c => exceptionChars.includes(c) || /\p{L}|\p{N}/u.test(c))
    .join('')
    .toLowerCase()
    .trim()
}
