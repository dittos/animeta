import { HttpStatus } from "@nestjs/common";
import { ApiException } from "src/controllers/exceptions";
import { Record } from "src/entities/record.entity";
import { History } from "src/entities/history.entity";
import { TitleMapping } from "src/entities/title_mapping.entity";
import { Work } from "src/entities/work.entity";
import { WorkIndex } from "src/entities/work_index.entity";
import { WorkTitleIndex } from "src/entities/work_title_index.entity";
import { db } from "src2/database";
import { AdminWorkDto } from "src2/schemas/admin";
import { serializeAdminWork } from "src2/serializers/adminWork";

export default async function(params: {
  workId: string;
  otherWorkId: string;
  forceMerge: boolean;
}): Promise<AdminWorkDto> {
  return await db.transaction(async () => {
    const work = await db.findOneOrFail(Work, params.workId)
    const other = await db.findOneOrFail(Work, params.otherWorkId)
    if (work.id === other.id) {
      throw new ApiException('Cannot merge itself', HttpStatus.BAD_REQUEST)
    }
    const conflicts = await db.query(`
      SELECT u.id, u.username, r1.id AS id1, r2.id AS id2
      FROM record_record r1
        JOIN record_record r2 ON r2.user_id = r1.user_id AND r2.work_id = $2
        JOIN auth_user u ON u.id = r1.user_id
      WHERE r1.work_id = $1
    `, [params.workId, params.otherWorkId])
    if (conflicts.length > 0 && !params.forceMerge) {
      throw new ApiException("Users with conflict exist", HttpStatus.UNPROCESSABLE_ENTITY, {
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
    await db.update(History, /* where */ {work_id: other.id}, /* updates */ {work_id: work.id})
    await db.update(Record, /* where */ {work_id: other.id}, /* updates */ {work_id: work.id})
    await db.delete(WorkTitleIndex, {work_id: other.id})
    await db.delete(WorkIndex, {work_id: other.id})
    await db.remove(other)
    return serializeAdminWork(work)
  })
}
