import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { Period } from "src/utils/period";
import { Repository } from "typeorm";
import { RecordService } from "./record.service";

type CuratedListSource = {
  type: 'popular';
} | {
  type: 'period';
  period: Period;
} | {
  type: 'year';
  year: number;
};

export type CuratedListMetadata = {
  id: string;
  name: string;
  source: CuratedListSource;
}

@Injectable()
export class CuratedListService {
  constructor(
    @InjectRepository(Work) private workRepository: Repository<Work>,
    private recordService: RecordService,
  ) {}

  getAllLists(): CuratedListMetadata[] {
    return [
      {id: 'popular', name: '인기', source: {type: 'popular'}},
      // TODO: 분기는 임시 값
      {id: '2021Q2', name: '이번 분기', source: {type: 'period', period: Period.parse('2021Q2')}},
      {id: '2021Q1', name: '지난 분기', source: {type: 'period', period: Period.parse('2021Q1')}},
      {id: '2020', name: '작년', source: {type: 'year', year: 2020}},
      {id: '2019', name: '2019년', source: {type: 'year', year: 2019}},
    ]
  }

  getList(id: string): CuratedListMetadata | null {
    return this.getAllLists().find(it => it.id === id)
  }

  async getWorks(metadata: CuratedListMetadata, currentUser: User): Promise<{ notAddedWorks: Work[]; totalCount: number; }> {
    const allWorks = await this.getAllWorks(metadata);
    const records = await Promise.all(allWorks.map(work => this.recordService.findByUserAndWork(currentUser, work)));
    const notAddedWorks = allWorks.filter((work, index) => !records[index]);
    return {
      notAddedWorks,
      totalCount: allWorks.length,
    };
  }

  private async getAllWorks(metadata: CuratedListMetadata): Promise<Work[]> {
    switch (metadata.source.type) {
      case 'popular':
        return this.workRepository.createQueryBuilder('work')
          .innerJoin('search_workindex', 'wi', 'wi.work_id = work.id')
          .where('wi.verified = true')
          .orderBy('wi.record_count', 'DESC')
          .limit(100)
          .getMany()
      case 'period':
        return this.workRepository.createQueryBuilder('work')
          .innerJoinAndSelect('search_workindex', 'wi', 'wi.work_id = work.id')
          .innerJoin('search_workperiodindex', 'wpi', 'wpi.work_id = work.id')
          .where('wpi.period = :period', { period: metadata.source.period.toString() })
          .andWhere('wi.verified = true')
          .orderBy('wi.record_count', 'DESC')
          .distinct()
          .getMany()
      case 'year':
        return this.workRepository.createQueryBuilder('work')
          .innerJoinAndSelect('search_workindex', 'wi', 'wi.work_id = work.id')
          .innerJoin('search_workperiodindex', 'wpi', 'wpi.work_id = work.id')
          .where('wpi.period like :periodPattern', { periodPattern: metadata.source.year + '%' })
          .andWhere('wi.verified = true')
          .orderBy('wi.record_count', 'DESC')
          .distinct()
          .getMany()
    }
  }
}
