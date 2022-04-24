import { Injectable } from "@nestjs/common";
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import * as DataLoader from "dataloader";
import { Episode } from "shared/types_generated";
import { History } from "src/entities/history.entity";
import { TitleMapping } from "src/entities/title_mapping.entity";
import { Work } from "src/entities/work.entity";
import { WorkIndex } from "src/entities/work_index.entity";
import { objResults } from "src/utils/dataloader";
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
    @InjectRepository(History) private historyRepository: Repository<History>,
    @InjectEntityManager() private entityManager: EntityManager,
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
    return getWorkImageUrl(work)
  }

  async getOrCreate(title: string): Promise<Work> {
    return getOrCreateWork(this.entityManager, title)
  }
}

export function getWorkImageUrl(work: Work): string | null {
  // TODO: config
  return work.image_filename ? `https://storage.googleapis.com/animeta-static/media/${work.image_filename}` : null
}

export async function getOrCreateWork(em: EntityManager, title: string): Promise<Work> {
  title = title.trim()
  if (title === '')
    throw new ValidationError('작품 제목을 입력하세요.')
  
  const mapping = await em.findOne(TitleMapping, { where: {title} })
  if (mapping) {
    return em.findOneOrFail(Work, mapping.work_id)
  }
  const key = normalizeTitle(title)
  const similarMapping = await em.findOne(TitleMapping, { where: {key} })
  if (similarMapping) {
    await em.save(TitleMapping, {
      work_id: similarMapping.work_id,
      title,
      key
    })
    return em.findOneOrFail(Work, similarMapping.work_id)
  }
  const work = new Work()
  work.title = title
  work.image_filename = null
  work.original_image_filename = null
  work.image_center_y = 0.0
  work.raw_metadata = null
  work.metadata = null
  work.blacklisted = false
  work.first_period = null
  await em.save(work)
  await em.save(TitleMapping, {
    work_id: work.id,
    title,
    key,
  })
  return work
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
