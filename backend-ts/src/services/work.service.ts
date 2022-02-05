import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as DataLoader from "dataloader";
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
  ) {}

  get(id: number): Promise<Work> {
    return this.dataLoader.load(id);
  }

  getIndex(id: number): Promise<WorkIndex> {
    return this.indexDataLoader.load(id);
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
