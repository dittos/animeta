import { Person } from "src/entities/person.entity";
import { WorkCast } from "src/entities/work_cast.entity";
import { WorkStaff } from "src/entities/work_staff.entity";
import { db } from "src2/database";
import { PersonDto } from "src2/schemas/admin";

export async function serializePerson(person: Person, compact: boolean = false): Promise<PersonDto> {
  return {
    id: person.id.toString(),
    name: person.name,
    metadata: person.metadata,
    staffs: compact ? undefined : (await db.find(WorkStaff, {where: {person}, relations: ['work']})).map(it => ({
      workId: it.work!.id.toString(),
      workTitle: it.work!.title,
      roleOrTask: it.task,
    })),
    casts: compact ? undefined : (await db.find(WorkCast, {where: {actor: person}, relations: ['work']})).map(it => ({
      workId: it.work!.id.toString(),
      workTitle: it.work!.title,
      roleOrTask: it.role,
    })),
  }
}
