import { ApiException } from "src/exceptions";
import { Record } from "src/entities/record.entity";
import { TitleMapping } from "src/entities/title_mapping.entity";
import { Work } from "src/entities/work.entity";
import { WorkCast } from "src/entities/work_cast.entity";
import { WorkCompany } from "src/entities/work_company.entity";
import { WorkIndex } from "src/entities/work_index.entity";
import { WorkPeriodIndex } from "src/entities/work_period_index.entity";
import { WorkStaff } from "src/entities/work_staff.entity";
import { WorkTitleIndex } from "src/entities/work_title_index.entity";
import { db } from "src/database";

export default async function(params: {workId: string}): Promise<boolean> {
  return await db.transaction(async () => {
    const work = await db.findOneOrFail(Work, params.workId)
    if (await db.findOne(Record, {where: {work_id: work.id}})) {
      throw new ApiException("Record exists", 403)
    }
    await db.delete(WorkIndex, {work_id: work.id})
    await db.delete(WorkTitleIndex, {work_id: work.id})
    await db.delete(WorkPeriodIndex, {work_id: work.id})
    await db.delete(TitleMapping, {work_id: work.id})
    await db.delete(WorkCast, {work_id: work.id})
    await db.delete(WorkStaff, {work_id: work.id})
    await db.delete(WorkCompany, {work_id: work.id})
    await db.remove(work)
    return true
  })
}
