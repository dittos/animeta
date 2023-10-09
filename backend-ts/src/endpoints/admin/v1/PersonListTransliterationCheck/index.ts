import { db } from "src/database";
import { sql, pgFormat } from '@databases/pg'
import { maxBy } from "lodash";

export default async function(params: {period: string}): Promise<{
  personId: string;
  name: string;
  recommendedTransliteration: string | null;
  count: number;
}[]> {
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
  return Promise.all(result.map(async it => ({
    personId: it.id.toString(),
    name: it.name,
    recommendedTransliteration: await getRecommendedTransliteration(it.name),
    count: it.count,
  })))
}

let transliterationMappingCache: Map<string, string> | null = null

async function getTransliterationMapping(): Promise<NonNullable<typeof transliterationMappingCache>> {
  if (!transliterationMappingCache) {
    transliterationMappingCache = new Map()
    const query = sql`
      select name, metadata->>'name_en' as name_en
      from person
      where name != metadata->>'name_en'
      limit 10000 -- cap memory
    `.format(pgFormat)
    const result: {name: string; name_en: string}[] = await db.query(query.text, query.values)
    const mapping: Map<string, string[]> = new Map()
    for (const {name, name_en} of result) {
      const parts = name.split(' ')
      const parts_en = name_en.split(' ').reverse()
      if (parts.length !== parts_en.length) continue
      for (let i = 0; i < parts_en.length; i++) {
        const existing = mapping.get(parts_en[i])
        if (existing)
          existing.push(parts[i])
        else
          mapping.set(parts_en[i], [parts[i]])
      }
    }
    for (const [part_en, candidates] of mapping.entries()) {
      let mapped = candidates[0]
      if (candidates.length > 1) {
        const counts = new Map<string, number>()
        for (const c of candidates) {
          counts.set(c, counts.get(c) ?? 1)
        }
        mapped = maxBy(Array.from(counts.entries()), ([_, v]) => v)![0]
      }
      transliterationMappingCache.set(part_en, mapped)
    }
  }
  return transliterationMappingCache
}

async function getRecommendedTransliteration(name: string): Promise<string | null> {
  if (!/[A-Za-z]/.test(name)) return null
  const mapping = await getTransliterationMapping()
  const parts = name.split(' ')
  if (!parts.some(part => mapping.has(part))) return null
  return parts.map(part => mapping.get(part) ?? part).reverse().join(' ')
}
