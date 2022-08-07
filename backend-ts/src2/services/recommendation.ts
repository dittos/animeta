import { caching } from "cache-manager";
import { sortBy } from "lodash";
import { Credit, CreditType, Recommendation } from "shared/types_generated";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { User } from "src/entities/user.entity";
import { WorkStaff } from "src/entities/work_staff.entity";
import { db } from "src2/database";

type RelatedStaffRow = {
  personId: number;
  staffTask: string;
  workId: number;
  workTitle: string;
}

export type RecommendationContext = {
  relatedStaffs: Map<number, RelatedStaffRow[]>;
}

const scoreByCreditType: {[P in CreditType]: number} = {
  ORIGINAL_WORK: 10,
  CHIEF_DIRECTOR: 20,
  SERIES_DIRECTOR: 20,
  DIRECTOR: 20,
  SERIES_COMPOSITION: 10,
  CHARACTER_DESIGN: 6,
  MUSIC: 5,
}
const compatibleCreditTypes: ReadonlyArray<ReadonlyArray<CreditType>> = [
  ['CHIEF_DIRECTOR', 'SERIES_DIRECTOR', 'DIRECTOR'],
  ['SERIES_COMPOSITION', 'ORIGINAL_WORK'],
]
const taskToCreditType: {[key: string]: CreditType} = {
  "chief director": 'CHIEF_DIRECTOR',
  "series director": 'SERIES_DIRECTOR',
  "director": 'DIRECTOR',
  "character design": 'CHARACTER_DESIGN',
  "animation character design": 'CHARACTER_DESIGN',
  "music": 'MUSIC',
  "series composition": 'SERIES_COMPOSITION',
  "original creator": 'ORIGINAL_WORK',
  "original work": 'ORIGINAL_WORK',
  "original story": 'ORIGINAL_WORK',
  "original manga": 'ORIGINAL_WORK',
}
const creditTypeOrder: CreditType[] = [
  'ORIGINAL_WORK',
  'CHIEF_DIRECTOR',
  'SERIES_DIRECTOR',
  'DIRECTOR',
  'SERIES_COMPOSITION',
  'CHARACTER_DESIGN',
  'MUSIC',
]
const cache = caching({
  store: 'memory',
  ttl: 60 * 60,
})

export async function createRecommendationContext(workIds: number[], user: User): Promise<RecommendationContext> {
  const relatedStaffs = new Map<number, RelatedStaffRow[]>()
  if (workIds.length > 0) {
    const relatedStaffRows = await db.createQueryBuilder()
      .from(WorkStaff, 's')
      .select('s2.person_id', 'personId')
      .addSelect('s2.task', 'staffTask')
      .addSelect('s2.work_id', 'workId')
      .addSelect('r.title', 'workTitle')
      .innerJoin(WorkStaff, 's2', 's2.person_id = s.person_id AND s2.work_id <> s.work_id')
      .innerJoin(Record, 'r', 'r.work_id = s2.work_id')
      .where('s.work_id IN (:...workIds) AND s2.work_id NOT IN (:...workIds)', { workIds })
      .andWhere('r.user_id = :userId', {userId: user.id})
      .andWhere('r.status_type IN (:...statusTypes)', {statusTypes: [StatusType.WATCHING, StatusType.FINISHED]})
      .groupBy('s2.person_id')
      .addGroupBy('s2.task')
      .addGroupBy('s2.work_id')
      .addGroupBy('r.title')
      .addGroupBy('r.updated_at')
      .orderBy('r.updated_at', 'DESC')
      .getRawMany<RelatedStaffRow>()
    for (const row of relatedStaffRows) {
      const group = relatedStaffs.get(row.personId) ?? []
      relatedStaffs.set(row.personId, group.concat(row))
    }
  }
  return {relatedStaffs}
}

export async function generateRecommendations(workId: number, context: RecommendationContext): Promise<{
  recommendations: Recommendation[],
  recommendationScore: number
}> {
  const workCredits = await cache.wrap<Credit[]>(`credit:${workId}`, async () => {
    return (await db.find(WorkStaff, { relations: ['person'], where: {work_id: workId} }))
      .map(staff => {
        const creditType = taskToCreditType[staff.task.toLowerCase()]
        if (!creditType) return null
        return {
          type: creditType,
          name: staff.person.name,
          personId: staff.person.id,
        }
      })
      .filter(it => it).map(it => it!)
      .sort((a, b) => creditTypeOrder.indexOf(a.type) - creditTypeOrder.indexOf(b.type))
  }, { ttl: 60 * 60 })
  const result = workCredits.map(credit => {
    const staffs = context.relatedStaffs.get(credit.personId)
    if (!staffs) return null
    let related0 = staffs.map((it, index) => {
      const creditType = taskToCreditType[it.staffTask.toLowerCase()]
      return creditType && isCompatible(creditType, credit.type) ?
        [[creditTypeOrder.indexOf(creditType), index],
          { workId: it.workId, workTitle: it.workTitle, creditType }]
        : null
    })
      .filter(it => it).map(it => it!)
    related0 = sortBy(related0, ([score, ]) => score)
    const related = related0.map(([, value]) => value)
    return {
      credit,
      related: related.slice(0, 2),
      score: (scoreByCreditType[credit.type] ?? 1) * related.length,
    }
  }).filter(it => it && it.related.length > 0).map(it => it!)
  const score = result.reduce((acc, it) => acc + it.score, 0) * result.length
  return {
    recommendations: result,
    recommendationScore: score,
  }
}

function isCompatible(a: CreditType, b: CreditType): boolean {
  if (a === b)
    return true
  return compatibleCreditTypes.some(it => it.includes(a) && it.includes(b))
}
