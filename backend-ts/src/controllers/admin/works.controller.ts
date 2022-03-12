import { Body, Controller, DefaultValuePipe, Get, HttpStatus, Param, ParseBoolPipe, ParseIntPipe, Post, Query } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { WorkDTO } from "shared/types_generated";
import { CurrentUser } from "src/auth/decorators";
import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { TitleMapping } from "src/entities/title_mapping.entity";
import { User } from "src/entities/user.entity";
import { Work } from "src/entities/work.entity";
import { WorkCast } from "src/entities/work_cast.entity";
import { WorkIndex } from "src/entities/work_index.entity";
import { WorkMetadata } from "src/entities/work_metadata";
import { WorkStaff } from "src/entities/work_staff.entity";
import { WorkTitleIndex } from "src/entities/work_title_index.entity";
import { WorkSerializer } from "src/serializers/work.serializer";
import { WorkService } from "src/services/work.service";
import { EntityManager } from "typeorm";
import { ApiException } from "../exceptions";
import * as tempy from "tempy";
import { ImageService } from "src/services/admin/image.service";
import * as cuid from "cuid";
import { AnnService } from "src/services/admin/ann.service";
import { getAnnMetadata } from "src/services/admin/ann_metadata_cache";

type AdminWorkDTO = {
  id: number;
  title: string;
  image_filename: string | null;
  image_path: string | null;
  image_center_y: number;
  raw_metadata: string;
  metadata: WorkMetadata | null;
  title_mappings: TitleMappingDTO[];
  index: AdminWorkIndexDTO | null;
  staffs: WorkStaffDTO[];
  casts: WorkCastDTO[];
}
type AdminWorkIndexDTO = {
  record_count: number;
}
type TitleMappingDTO = {
  id: number;
  title: string;
  record_count: number;
}
type WorkStaffDTO = {
  task: string;
  name: string;
  personId: number;
  metadata: {} | null;
}
type WorkCastDTO = {
  role: string;
  name: string;
  personId: number;
  metadata: {} | null;
}
type CrawlImageOptions = {
  source: 'ann';
  annId: string;
} | {
  source: 'url';
  url: string;
}

@Controller('/api/admin/v0/works')
export class AdminWorksController {
  constructor(
    @InjectEntityManager() private entityManager: EntityManager,
    private workService: WorkService,
    private workSerializer: WorkSerializer,
    private imageService: ImageService,
    private annService: AnnService,
  ) {
  }

  @Get()
  async getWorks(
    @CurrentUser({ staffRequired: true }) currentUser: User,
    @Query('orphans', new DefaultValuePipe('false'), ParseBoolPipe) onlyOrphans: boolean,
    @Query('offset', new DefaultValuePipe('0'), ParseIntPipe) offset: number,
  ): Promise<Array<WorkDTO>> {
    const works = await this.entityManager.find(Work, {
      where: {
        blacklisted: false,
        // TODO: onlyOrphans
      },
      order: {id: 'DESC'},
      skip: offset,
      take: 50,
    })
    return Promise.all(works.map(it => this.workSerializer.serialize(it)))
  }

  @Post()
  async createWork(
    @CurrentUser({ staffRequired: true }) currentUser: User,
    @Body() request: {title: string},
  ): Promise<WorkDTO> {
    const work = await this.workService.getOrCreate(request.title)
    return this.workSerializer.serialize(work)
  }

  @Get(':id')
  async getWork(
    @CurrentUser({ staffRequired: true }) currentUser: User,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AdminWorkDTO> {
    const work = await this.entityManager.findOneOrFail(Work, id)
    const titleMappings = await this.entityManager.find(TitleMapping, {where: {work_id: work.id}})
    const titleMappingDtos: TitleMappingDTO[] = (await Promise.all(titleMappings.map(async it => ({
      id: it.id,
      title: it.title,
      record_count: await this.entityManager.count(Record, {where: {title: it.title}})
    })))).sort((a, b) => b.record_count - a.record_count)
    const index = await this.entityManager.findOne(WorkIndex, {where: {work_id: work.id}})
    return {
      id: work.id,
      title: work.title,
      image_filename: work.image_filename,
      image_path: this.workService.getImageUrl(work),
      image_center_y: work.image_center_y,
      raw_metadata: work.raw_metadata ?? '',
      metadata: work.metadata,
      title_mappings: titleMappingDtos,
      index: index ? {record_count: index.record_count} : null,
      staffs: (await this.entityManager.find(WorkStaff, {
        where: {work_id: work.id},
        order: {position: 'ASC'},
        relations: ['person'],
      })).map(it => ({
        task: it.task,
        name: it.person.name,
        personId: it.person.id,
        metadata: it.metadata,
      })),
      casts: (await this.entityManager.find(WorkCast, {
        where: {work_id: work.id},
        order: {position: 'ASC'},
        relations: ['actor']
      })).map(it => ({
        role: it.role,
        name: it.actor.name,
        personId: it.actor.id,
        metadata: it.metadata,
      })),
    }
  }
  
  @Post(':id')
  async editWork(
    @CurrentUser({ staffRequired: true }) currentUser: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: {
      primaryTitleMappingId?: number;
      mergeWorkId?: number;
      forceMerge?: boolean;
      rawMetadata?: string;
      crawlImage?: CrawlImageOptions,
      blacklisted?: boolean;
      imageCenterY?: number;
      importAnnMetadata?: string;
    }
  ): Promise<AdminWorkDTO> {
    if (request.primaryTitleMappingId != null) {
      await this.setPrimaryTitleMapping(request.primaryTitleMappingId)
    }
    if (request.mergeWorkId != null) {
      await this.mergeWork(id, request.mergeWorkId, request.forceMerge ?? false)
    }
    if (request.rawMetadata != null) {
      await this.editMetadata(id, request.rawMetadata)
    }
    if (request.crawlImage != null) {
      await this.crawlImage(id, request.crawlImage)
    }
    if (request.blacklisted != null) {
      if (!id) throw new Error()
      await this.entityManager.update(Work, {id}, {blacklisted: request.blacklisted})
    }
    if (request.imageCenterY != null) {
      if (!id) throw new Error()
      await this.entityManager.update(Work, {id}, {image_center_y: request.imageCenterY})
    }
    if (request.importAnnMetadata != null) {
      const metadata = await getAnnMetadata(request.importAnnMetadata!)
      await this.entityManager.transaction(async em => {
        const work = await em.findOneOrFail(Work, id)
        await this.annService.importMetadata(em, work, metadata)
        await em.save(work)
      })
    }
    return this.getWork(currentUser, id)
  }

  private async setPrimaryTitleMapping(primaryTitleMappingId: number) {
    const mapping = await this.entityManager.findOneOrFail(TitleMapping, primaryTitleMappingId)
    const work = await this.entityManager.findOneOrFail(Work, mapping.work_id)
    work.title = mapping.title
    await this.entityManager.save(work)
  }

  private async mergeWork(workId: number, otherWorkId: number, force: boolean) {
    await this.entityManager.transaction(async em => {
      const work = await em.findOneOrFail(Work, workId)
      const other = await em.findOneOrFail(Work, otherWorkId)
      if (work.id === other.id) {
        throw new ApiException('Cannot merge itself', HttpStatus.BAD_REQUEST)
      }
      const conflicts = await em.query(`
        SELECT u.id, u.username, r1.id AS id1, r2.id AS id2
        FROM record_record r1
          JOIN record_record r2 ON r2.user_id = r1.user_id AND r2.work_id = $2
          JOIN auth_user u ON u.id = r1.user_id
        WHERE r1.work_id = $1
      `, [workId, otherWorkId])
      if (conflicts.length > 0 && !force) {
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
        await em.delete(History, {user_id: conflict.id, work_id: other.id})
        await em.delete(Record, {user_id: conflict.id, work_id: other.id})
      }
      await em.update(TitleMapping, /* where */ {work_id: other.id}, /* updates */ {work_id: work.id})
      await em.update(History, /* where */ {work_id: other.id}, /* updates */ {work_id: work.id})
      await em.update(Record, /* where */ {work_id: other.id}, /* updates */ {work_id: work.id})
      await em.delete(WorkTitleIndex, {work_id: other.id})
      await em.delete(WorkIndex, {work_id: other.id})
      await em.remove(other)
    })
  }

  private async editMetadata(id: number, rawMetadata: string) {
    await this.entityManager.transaction(async em => {
      const work = await em.findOneOrFail(Work, id)
      await this.workService.editMetadata(em, work, rawMetadata)
    })
  }

  private async crawlImage(id: number, options: CrawlImageOptions) {
    const work = await this.entityManager.findOneOrFail(Work, id)
    await tempy.file.task(async tempFile => {
      await tempy.file.task(async tempThumbFile => {
        switch (options.source) {
          case 'ann':
            await this.imageService.downloadAnnPoster(options.annId, tempFile)
            await this.imageService.generateThumbnail(tempFile, tempThumbFile)
            work.original_image_filename = `ann${options.annId}.jpg`
            work.image_filename = `thumb/v2/${work.original_image_filename}`
            await this.imageService.upload(tempFile, work.original_image_filename)
            await this.imageService.upload(tempThumbFile, work.image_filename)
            await this.entityManager.save(work)
            break;
          case 'url':
            await this.imageService.download(options.url, tempFile)
            await this.imageService.generateThumbnail(tempFile, tempThumbFile)
            work.original_image_filename = cuid()
            work.image_filename = `thumb/${work.original_image_filename}`
            await this.imageService.upload(tempFile, work.original_image_filename)
            await this.imageService.upload(tempThumbFile, work.image_filename)
            await this.entityManager.save(work)
            break;
        }
      }, {extension: 'jpg'})
    })
  }
}
