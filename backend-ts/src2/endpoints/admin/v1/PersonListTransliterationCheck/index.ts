import { Type } from "@sinclair/typebox";
import { Person } from "src/entities/person.entity";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";
import { serializePerson } from "src2/serializers/person";
import { sql, pgFormat } from '@databases/pg'

const Params = Type.Object({
  period: Type.String(),
})

const Result = Type.Array(Type.Object({
  personId: Type.Number(),
  name: Type.String(),
  count: Type.Number(),
}))

export default createEndpoint(Params, Result, async (params) => {
  const tasks = sql`(${sql.join([
    "chief director",
    "series director",
    "director",
    "character design",
    "animation character design",
    "music",
    "series composition",
    "original creator",
    "original work",
    "original story",
    "original manga",
  ].map(it => sql`${it}`), sql`, `)})`
  const query = sql`
    select
      p.id AS id, p.name AS name, count(*) AS count
    from
      work_staff ws
      join search_workperiodindex wpi on ws.work_id = wpi.work_id
      join person p on p.id = ws.person_id
    where
      p.id in (
        select distinct
          p.id
        from
          work_staff ws
          join search_workperiodindex wpi on ws.work_id = wpi.work_id
          join person p on p.id = ws.person_id
        where
          wpi.period = ${params.period}
          and wpi.is_first_period
          and lower(ws.task) in ${tasks}
      )
      and lower(ws.task) in ${tasks}
      and wpi.period < ${params.period}
    group by p.id, p.name
    having count(*) >= 1
  `.format(pgFormat)
  const result: { id: number; name: string; count: number; }[] = await db.query(query.text, query.values)
  return result.map(it => ({
    personId: it.id,
    name: it.name,
    count: it.count,
  }))
})
