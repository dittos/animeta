import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as DataLoader from "dataloader";
import { Episode } from "shared/types_generated";
import { History } from "src/entities/history.entity";
import { Work } from "src/entities/work.entity";
import { WorkIndex } from "src/entities/work_index.entity";
import { objResults } from "src/utils/dataloader";
import { Repository } from "typeorm";

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
}
