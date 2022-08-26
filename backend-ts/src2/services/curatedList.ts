import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { Period } from "src/utils/period";
import { db } from "src2/database";
import { getRecordByUserAndWork } from "./record";
import { Periods } from "./table";

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

export function getAllCuratedLists(): CuratedListMetadata[] {
  return [
    {id: 'popular', name: '인기', source: {type: 'popular'}},
    {id: 'current-period', name: '이번 분기', source: {type: 'period', period: Periods.current}},
    {id: 'previous-period', name: '지난 분기', source: {type: 'period', period: Periods.current.previous()}},
    {id: '2021', name: '올해', source: {type: 'year', year: 2021}},
    {id: '2020', name: '작년', source: {type: 'year', year: 2020}},
    {id: '2019', name: '2019년', source: {type: 'year', year: 2019}},
    {id: '2018', name: '2018년', source: {type: 'year', year: 2018}},
    {id: '2017', name: '2017년', source: {type: 'year', year: 2017}},
  ]
}

export function getCuratedList(id: string): CuratedListMetadata | null {
  return getAllCuratedLists().find(it => it.id === id) ?? null
}

export async function getCuratedListWorks(metadata: CuratedListMetadata, currentUser: User | null): Promise<{ notAddedWorks: Work[]; totalCount: number; }> {
  const allWorks = await getAllWorks(metadata);
  const records = currentUser ? await Promise.all(allWorks.map(work => getRecordByUserAndWork(currentUser, work))) : [];
  const notAddedWorks = allWorks.filter((work, index) => !records[index]);
  return {
    notAddedWorks,
    totalCount: allWorks.length,
  };
}

async function getAllWorks(metadata: CuratedListMetadata): Promise<Work[]> {
  switch (metadata.source.type) {
    case 'popular':
      return db.createQueryBuilder(Work, 'work')
        .innerJoin('search_workindex', 'wi', 'wi.work_id = work.id')
        .where('wi.verified = true')
        .orderBy('wi.record_count', 'DESC')
        .limit(100)
        .getMany()
    case 'period':
      return db.createQueryBuilder(Work, 'work')
        .innerJoinAndSelect('search_workindex', 'wi', 'wi.work_id = work.id')
        .innerJoin('search_workperiodindex', 'wpi', 'wpi.work_id = work.id')
        .where('wpi.period = :period', { period: metadata.source.period.toString() })
        .andWhere('wi.verified = true')
        .orderBy('wi.record_count', 'DESC')
        .distinct()
        .getMany()
    case 'year':
      return db.createQueryBuilder(Work, 'work')
        .innerJoinAndSelect('search_workindex', 'wi', 'wi.work_id = work.id')
        .innerJoin('search_workperiodindex', 'wpi', 'wpi.work_id = work.id')
        .where('wpi.period like :periodPattern', { periodPattern: metadata.source.year + '%' })
        .andWhere('wi.verified = true')
        .orderBy('wi.record_count', 'DESC')
        .distinct()
        .getMany()
  }
}
