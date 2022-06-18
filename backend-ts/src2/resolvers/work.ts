import { WorkMetadata, WorkResolvers, WorkSchedule } from "src/graphql/generated"
import { getWorkImageUrl } from "src/services/work.service"
import { Work as WorkEntity } from "src/entities/work.entity"
import { Schedule } from "src/entities/work_metadata_raw"
import { Temporal } from "@js-temporal/polyfill"
import { getWorkEpisode, getWorkEpisodes, getWorkIndex } from "src2/services/work"
import { db } from "src2/database"
import { Record } from "src/entities/record.entity"
import { getRecordByUserAndWork } from "src2/services/record"
import { History } from "src/entities/history.entity"
import { LessThan, Not } from "typeorm"

export const Work: WorkResolvers = {
  imageUrl: (work) => getWorkImageUrl(work),
  record: (work, _, ctx) => ctx.currentUser ? getRecordByUserAndWork(ctx.currentUser, work) : null,
  recordCount: async (work) => {
    const index = await getWorkIndex(work.id)
    return index?.record_count ?? await db.count(Record, { where: {work_id: work.id} })
  },
  metadata: (work) => serializeMetadata(work),
  episodes: (work) => getWorkEpisodes(work),
  episode: (work, { episode }) => getWorkEpisode(work, episode),
  async posts(work, { beforeId, count, episode }) {
    count = Math.min(count ?? 32, 128)
    const nodes = await db.find(History, {
      where: {
        work_id: work.id,
        comment: Not(''),
        ...beforeId ? { id: LessThan(beforeId) } : {},
        ...episode ? { status: episode } : {},
      },
      order: { id: 'DESC' },
      take: count + 1,
    })
    return {
      nodes: nodes.slice(0, count),
      hasMore: nodes.length > count,
    }
  }
}

function serializeMetadata(work: WorkEntity): WorkMetadata | null {
  const metadata = work.metadata
  if (!metadata) return null

  // const title = metadata.title ?? work.title

  return {
    studioNames: metadata.studios ?? null,
    source: metadata.source ?? null,
    schedules: metadata.schedules ? serializeSchedules(metadata.schedules) : [],
    durationMinutes: metadata.durationMinutes ?? null,
    websiteUrl: metadata.website ?? null,
    namuwikiUrl: metadata.namuRef ? namuLink(metadata.namuRef) : null,
    annUrl: metadata.annId ? `http://www.animenewsnetwork.com/encyclopedia/anime.php?id=${metadata.annId}` : null,
  }
}

const defaultTimeZone = Temporal.TimeZone.from('Asia/Seoul')

function serializeSchedules(schedules: {[country: string]: Schedule}): WorkSchedule[] {
  const result: WorkSchedule[] = []
  for (const [country, schedule] of Object.entries(schedules)) {
    result.push({
      country,
      date: schedule.datePrecision !== 'YEAR_MONTH' && schedule.date ?
        Temporal.PlainDate.from(schedule.date)
          .toZonedDateTime(defaultTimeZone).toInstant().epochMilliseconds :
        null,
      datePrecision: schedule.datePrecision,
      broadcasts: schedule.broadcasts ?? null,
    })
  }
  return result
}

function namuLink(ref: string): string {
  let page = ref
  let anchor = ''
  const anchorIndex = ref.lastIndexOf('#')
  if (anchorIndex >= 0) {
    page = ref.substring(0, anchorIndex)
    anchor = ref.substring(anchorIndex + 1)
  }
  let url = `https://namu.wiki/w/${encodeURIComponent(page)}`
  if (anchor) {
    url += '#' + encodeURIComponent(anchor)
  }
  return url
}