import { Injectable } from "@nestjs/common";
import { WorkService } from "src/services/work.service";
import { Repository } from "typeorm";
import { Record } from 'src/entities/record.entity';
import { RecordSerializer } from "./record.serializer";
import { InjectRepository } from "@nestjs/typeorm";
import { Work } from "src/entities/work.entity";
import { User } from "src/entities/user.entity";
import { WorkDTO, WorkLinks, WorkMetadataDTO, WorkSchedule } from "shared/types_generated";
import { RecordService } from "src/services/record.service";
import { Schedule } from "src/entities/work_metadata";
import { Temporal } from "@js-temporal/polyfill";

@Injectable()
export class WorkSerializer {
  private defaultTimeZone = Temporal.TimeZone.from('Asia/Seoul')

  constructor(
    private workService: WorkService,
    private recordService: RecordService,
    @InjectRepository(Record) private recordRepository: Repository<Record>,
    private recordSerializer: RecordSerializer,
  ) {}

  async serialize(
    work: Work,
    viewer: User | null = null,
    full: boolean = false
  ): Promise<WorkDTO> {
    const index = await this.workService.getIndex(work.id)
    const record = viewer ? await this.recordService.findByUserAndWorkId(viewer, work.id) : null
    return {
      id: work.id,
      title: work.title,
      image_url: this.workService.getImageUrl(work),
      image_center_y: work.image_center_y,
      episodes: full ? await this.workService.getEpisodes(work) : null,
      record_count: index?.record_count ?? await this.recordRepository.count({ where: {work_id: work.id} }),
      record: record ? await this.recordSerializer.serialize(record, RecordSerializer.legacyOptions()) : null,
      metadata: this.serializeMetadata(work),

      recommendations: null,
      recommendationScore: 0,
    }
  }

  private serializeMetadata(work: Work): WorkMetadataDTO | null {
    const metadata = work.metadata
    if (!metadata) return null

    const title = metadata.title ?? work.title

    const links: WorkLinks = {
      website: metadata.website ?? null,
      namu: metadata.namuRef ? this.namuLink(metadata.namuRef) : null,
      ann: metadata.annId ? `http://www.animenewsnetwork.com/encyclopedia/anime.php?id=${metadata.annId}` : null,
    }

    return {
      title,
      links,
      studios: metadata.studios ?? null,
      source: metadata.source ?? null,
      schedule: metadata.schedules ? this.serializeSchedules(metadata.schedules) : {},
      durationMinutes: metadata.durationMinutes ?? null,
    }
  }

  private serializeSchedules(schedules: {[country: string]: Schedule}): {[country: string]: WorkSchedule} {
    const result: {[country: string]: WorkSchedule} = {}
    for (const [country, schedule] of Object.entries(schedules)) {
      result[country] = {
        date: schedule.datePrecision !== 'YEAR_MONTH' && schedule.date ?
          Temporal.PlainDate.from(schedule.date)
            .toZonedDateTime(this.defaultTimeZone).toInstant().epochMilliseconds :
          null,
        date_only: schedule.datePrecision ? schedule.datePrecision === 'DATE' : null,
        broadcasts: schedule.broadcasts ?? null,
      }
    }
    return result
  }

  private namuLink(ref: string): string {
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
}
