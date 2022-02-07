import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

type CountByCriteria = {[key: string]: number} & {_all: number}

export type RecordsCount = {
  total: number;
  filtered: number;
  by_status_type: CountByCriteria;
  by_category_id: CountByCriteria;
}

type CountGroupRow = {
  count: number;
  status_type: StatusType;
  category_id: number | null;
}

@Injectable()
export class UserRecordsService {
  constructor(
    @InjectRepository(Record) private recordRepository: Repository<Record>,
  ) {
  }

  async count(
    user: User,
    statusType: StatusType | null,
    categoryId: number | null
  ): Promise<RecordsCount> {
    const counts: CountGroupRow[] = (await this.recordRepository.createQueryBuilder()
      .select('COUNT(*)', 'count')
      .addSelect('status_type')
      .addSelect('category_id')
      .where({ user })
      .groupBy('status_type')
      .addGroupBy('category_id')
      .getRawMany())
      .map(it => ({
        count: Number(it.count), // count(*) returned as string when getRawMany
        status_type: it.status_type,
        category_id: it.category_id,
      }))
    const filtered = this.filterCounts(counts, statusType, categoryId)
    const countByStatusType: CountByCriteria = { _all: 0 }
    for (const row of this.filterCounts(counts, null, categoryId)) {
      countByStatusType._all += row.count
      const key = StatusType[row.status_type].toLowerCase()
      if (!countByStatusType[key]) countByStatusType[key] = 0
      countByStatusType[key] += row.count
    }
    const countByCategory: CountByCriteria = { _all: 0 }
    for (const row of this.filterCounts(counts, statusType, null)) {
      countByCategory._all += row.count
      const key = row.category_id?.toString() ?? '0'
      if (!countByCategory[key]) countByCategory[key] = 0
      countByCategory[key] += row.count
    }
    return {
      total: counts.reduce((acc, it) => acc + it.count, 0),
      filtered: filtered.reduce((acc, it) => acc + it.count, 0),
      by_status_type: countByStatusType,
      by_category_id: countByCategory,
    }
  }

  private filterCounts(
    counts: CountGroupRow[],
    statusType: StatusType | null,
    categoryId: number | null
  ): CountGroupRow[] {
    let result = counts
    if (statusType != null) {
      result = result.filter(it => it.status_type === statusType)
    }
    if (categoryId != null) {
      result = result.filter(it => (it.category_id ?? 0) === categoryId)
    }
    return result
  }
}
