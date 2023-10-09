import { Record } from "src/entities/record.entity";
import { TitleMapping } from "src/entities/title_mapping.entity";
import { Work } from "src/entities/work.entity";
import { WorkCast } from "src/entities/work_cast.entity";
import { WorkIndex } from "src/entities/work_index.entity";
import { WorkStaff } from "src/entities/work_staff.entity";
import { getWorkImageUrl } from "src/services/work";
import { db } from "src/database";
import { TitleMappingDto, AdminWorkDto } from "src/schemas/admin";

export async function serializeAdminWork(work: Work): Promise<AdminWorkDto> {
  const titleMappings = await db.find(TitleMapping, {where: {work_id: work.id}})
  const titleMappingDtos: TitleMappingDto[] = (await Promise.all(titleMappings.map(async it => ({
    id: it.id.toString(),
    title: it.title,
    record_count: await db.count(Record, {where: {title: it.title}})
  })))).sort((a, b) => b.record_count - a.record_count)
  const index = await db.findOne(WorkIndex, {where: {work_id: work.id}})
  return {
    id: work.id.toString(),
    title: work.title,
    image_filename: work.image_filename,
    image_path: getWorkImageUrl(work),
    image_center_y: work.image_center_y,
    raw_metadata: work.raw_metadata ?? '',
    metadata: work.metadata,
    title_mappings: titleMappingDtos,
    index: index ? {record_count: index.record_count} : null,
    staffs: (await db.find(WorkStaff, {
      where: {work_id: work.id},
      order: {position: 'ASC'},
      relations: ['person'],
    })).map(it => ({
      task: it.task,
      name: it.person.name,
      personId: it.person.id.toString(),
      metadata: it.metadata,
    })),
    casts: (await db.find(WorkCast, {
      where: {work_id: work.id},
      order: {position: 'ASC'},
      relations: ['actor']
    })).map(it => ({
      role: it.role,
      name: it.actor.name,
      personId: it.actor.id.toString(),
      metadata: it.metadata,
    })),
  }
}
