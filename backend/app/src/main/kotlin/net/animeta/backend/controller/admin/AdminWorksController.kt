package net.animeta.backend.controller.admin

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import net.animeta.backend.db.Datastore
import net.animeta.backend.db.query
import net.animeta.backend.dto.WorkDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.metadata.WorkMetadata
import net.animeta.backend.model.QUser.user
import net.animeta.backend.model.QWork.work
import net.animeta.backend.model.TitleMapping
import net.animeta.backend.model.User
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.repository.TitleMappingRepository
import net.animeta.backend.repository.WorkIndexRepository
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.repository.WorkTitleIndexRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.WorkSerializer
import net.animeta.backend.service.WorkService
import net.animeta.backend.service.admin.AnnMetadataCache
import net.animeta.backend.service.admin.AnnService
import net.animeta.backend.service.admin.ImageService
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.io.File
import java.util.UUID

@RestController
@RequestMapping("/admin")
class AdminWorksController(
    private val datastore: Datastore,
    private val workService: WorkService,
    private val imageService: ImageService,
    private val workRepository: WorkRepository,
    private val workIndexRepository: WorkIndexRepository,
    private val workTitleIndexRepository: WorkTitleIndexRepository,
    private val recordRepository: RecordRepository,
    private val titleMappingRepository: TitleMappingRepository,
    private val historyRepository: HistoryRepository,
    private val workSerializer: WorkSerializer,
    private val annService: AnnService,
    private val annMetadataCache: AnnMetadataCache,
    private val objectMapper: ObjectMapper
) {
    @GetMapping("/works")
    fun getWorks(@CurrentUser(staffRequired = true) currentUser: User,
                 @RequestParam("orphans", defaultValue = "false") onlyOrphans: Boolean,
                 @RequestParam(defaultValue = "0") offset: Int): List<WorkDTO> {
        var query = work.query.filter(work.blacklisted.isFalse)
//        if (onlyOrphans) {
//            query = query.filter(work.indexes.any().record_count.eq(0))
//        }
        query = query.orderBy(work.id.desc()).offset(offset).limit(50)
        return datastore.query(query).map { workSerializer.serialize(it) }
    }

    data class CreateWorkRequest(val title: String)

    @PostMapping("/works")
    fun createWork(@CurrentUser(staffRequired = true) currentUser: User,
                   @RequestBody request: CreateWorkRequest): WorkDTO {
        val work = workService.getOrCreate(request.title)
        return workSerializer.serialize(work)
    }

    data class TitleMappingDTO(val id: Int, val title: String, val record_count: Int)
    data class AdminWorkIndexDTO(val record_count: Int, val rank: Int)
    data class AdminWorkDTO(
        val id: Int,
        val title: String,
        val image_filename: String?,
        val image_path: String?,
        val image_center_y: Double,
        val raw_metadata: String,
        val metadata: WorkMetadata?,
        val title_mappings: List<TitleMappingDTO>,
        val index: AdminWorkIndexDTO?,
        val staffs: List<WorkStaffDTO>,
        val casts: List<WorkCastDTO>
    )
    data class WorkStaffDTO(
        val task: String,
        val name: String,
        val personId: Int,
        var metadata: JsonNode?
    )
    data class WorkCastDTO(
        val role: String,
        val name: String,
        val personId: Int,
        var metadata: JsonNode?
    )

    @GetMapping("/works/{id}")
    fun getWork(@CurrentUser(staffRequired = true) currentUser: User,
                @PathVariable id: Int): AdminWorkDTO {
        val work = workRepository.findById(id).orElse(null)
        val titleMappings = work.titleMappings.map {
            TitleMappingDTO(
                id = it.id!!,
                title = it.title,
                record_count = recordRepository.countByTitle(it.title)
            )
        }.sortedByDescending { it.record_count }
        val index = workIndexRepository.findOneByWorkId(work.id!!)
        return AdminWorkDTO(
            id = work.id!!,
            title = work.title,
            image_filename = work.image_filename,
            image_path = workSerializer.getImageUrl(work),
            image_center_y = work.image_center_y,
            raw_metadata = work.raw_metadata ?: "",
            metadata = work.metadata?.let { objectMapper.readValue<WorkMetadata>(it) },
            title_mappings = titleMappings,
            index = index?.let { AdminWorkIndexDTO(record_count = it.record_count, rank = it.rank) },
            staffs = work.staffs.map {
                WorkStaffDTO(it.task, it.person.name, it.person.id!!, it.metadata?.let(objectMapper::readTree))
            },
            casts = work.casts.map {
                WorkCastDTO(it.role, it.actor.name, it.actor.id!!, it.metadata?.let(objectMapper::readTree))
            }
        )
    }

    data class CrawlImageOptions(val source: String, val annId: String?, val url: String?)
    data class EditWorkRequest(val primaryTitleMappingId: Int? = null,
                               val mergeWorkId: Int? = null,
                               val forceMerge: Boolean? = null,
                               val rawMetadata: String? = null,
                               val crawlImage: CrawlImageOptions? = null,
                               val blacklisted: Boolean? = null,
                               val imageCenterY: Double? = null,
                               val importAnnMetadata: String? = null)

    @PostMapping("/works/{id}")
    @Transactional
    fun editWork(@CurrentUser(staffRequired = true) currentUser: User,
                 @PathVariable id: Int,
                 @RequestBody request: EditWorkRequest): AdminWorkDTO {
        if (request.primaryTitleMappingId != null) {
            setPrimaryTitleMapping(request.primaryTitleMappingId)
        }
        if (request.mergeWorkId != null) {
            mergeWork(id, request.mergeWorkId, request.forceMerge ?: false)
        }
        if (request.rawMetadata != null) {
            editMetadata(id, request.rawMetadata)
        }
        if (request.crawlImage != null) {
            crawlImage(id, request.crawlImage)
        }
        if (request.blacklisted != null) {
            val work = workRepository.findById(id).orElse(null)
            work.blacklisted = request.blacklisted
            workRepository.save(work)
        }
        if (request.imageCenterY != null) {
            val work = workRepository.findById(id).orElse(null)
            work.image_center_y = request.imageCenterY
            workRepository.save(work)
        }
        if (request.importAnnMetadata != null) {
            val work = workRepository.findById(id).orElse(null)
            annService.importMetadata(work, annMetadataCache.getMetadata(request.importAnnMetadata))
            workRepository.save(work)
        }
        return getWork(currentUser, id)
    }

    private fun setPrimaryTitleMapping(primaryTitleMappingId: Int) {
        val mapping = titleMappingRepository.findById(primaryTitleMappingId).orElse(null)
        mapping.work.title = mapping.title
        workRepository.save(mapping.work)
    }

    data class MergeError(val conflicts: List<MergeConflictDTO>)
    data class MergeConflictDTO(val user_id: Int, val username: String, val ids: List<Int>)

    private fun mergeWork(workId: Int, otherWorkId: Int, force: Boolean) {
        val work = workRepository.findById(workId).orElse(null)
        val other = workRepository.findById(otherWorkId).orElse(null)
        if (work.id == other.id) {
            throw ApiException("Cannot merge itself", HttpStatus.BAD_REQUEST)
        }
        val conflicts = datastore.query(user.query.filter(user.records.any().workId.eq(work.id!!)
                .and(user.records.any().workId.eq(other.id!!))))
        if (conflicts.isNotEmpty() && !force) {
            throw ApiException("Users with conflict exist", HttpStatus.UNPROCESSABLE_ENTITY,
                    MergeError(conflicts = conflicts.map { MergeConflictDTO(
                            user_id = it.id!!,
                            username = it.username,
                            ids = it.records.filter { it.workId == work.id || it.workId == other.id }.map { it.id!! }
                    ) }))
        }
        for (u in conflicts) {
            historyRepository.deleteByUserAndWorkId(u, other.id!!)
            recordRepository.deleteByUserAndWorkId(u, other.id!!)
        }
        titleMappingRepository.replaceWork(other, work)
        historyRepository.replaceWorkId(other.id!!, work.id!!)
        recordRepository.replaceWorkId(other.id!!, work.id!!)
        workTitleIndexRepository.deleteAllByWork(other)
        workIndexRepository.deleteById(other.id!!)
        workRepository.delete(other)
    }

    @Transactional
    fun editMetadata(id: Int, rawMetadata: String) {
        val work = workRepository.findById(id).orElse(null)
        workService.editMetadata(work, rawMetadata)
    }

    private fun crawlImage(id: Int, options: CrawlImageOptions) {
        val work = workRepository.findById(id).orElse(null)
        val tempFile = File.createTempFile("orig", ".tmp")
        val tempThumbFile = File.createTempFile("thumb", ".jpg")
        try {
            when (options.source) {
                "ann" -> {
                    imageService.downloadAnnPoster(options.annId!!, tempFile)
                    imageService.generateThumbnail(tempFile, tempThumbFile)
                    work.original_image_filename = "ann${options.annId}.jpg"
                    work.image_filename = "thumb/v2/${work.original_image_filename}"
                    imageService.upload(tempFile, work.original_image_filename!!)
                    imageService.upload(tempThumbFile, work.image_filename!!)
                    workRepository.save(work)
                }
                "url" -> {
                    imageService.download(options.url!!, tempFile)
                    imageService.generateThumbnail(tempFile, tempThumbFile)
                    work.original_image_filename = UUID.randomUUID().toString()
                    work.image_filename = "thumb/${work.original_image_filename}"
                    imageService.upload(tempFile, work.original_image_filename!!)
                    imageService.upload(tempThumbFile, work.image_filename!!)
                    workRepository.save(work)
                }
            }
        } finally {
            tempFile.delete()
            tempThumbFile.delete()
        }
    }

    data class DeleteResponse(val ok: Boolean)

    @DeleteMapping("/works/{id}")
    @Transactional
    fun deleteWork(@CurrentUser(staffRequired = true) currentUser: User,
                   @PathVariable id: Int): DeleteResponse {
        val work = workRepository.findById(id).orElse(null)
        if (recordRepository.countByWorkId(work.id!!) != 0) {
            throw ApiException("Record exists", HttpStatus.FORBIDDEN)
        }
        workRepository.delete(work)
        return DeleteResponse(true)
    }

    data class AddTitleMappingRequest(val title: String)

    @PostMapping("/works/{id}/title-mappings")
    @Transactional
    fun addTitleMapping(@CurrentUser(staffRequired = true) currentUser: User,
                        @PathVariable id: Int,
                        @RequestBody request: AddTitleMappingRequest): TitleMappingDTO {
        val work = workRepository.findById(id).orElse(null)
        val title = request.title.trim()
        val key = WorkService.normalizeTitle(title)
        if (titleMappingRepository.countByKeyAndWorkIsNot(key, work) > 0) {
            throw ApiException("Title already mapped", HttpStatus.FORBIDDEN)
        }
        val mapping = TitleMapping(work = work, title = title, key = key)
        titleMappingRepository.save(mapping)
        return TitleMappingDTO(id = mapping.id!!, title = title, record_count = 0)
    }

    @DeleteMapping("/title-mappings/{id}")
    fun deleteTitleMapping(@CurrentUser(staffRequired = true) currentUser: User, @PathVariable id: Int): DeleteResponse {
        val mapping = titleMappingRepository.findById(id).orElse(null)
        if (recordRepository.countByTitle(mapping.title) > 0) {
            throw ApiException("Record exists", HttpStatus.FORBIDDEN)
        }
        titleMappingRepository.delete(mapping)
        return DeleteResponse(true)
    }
}
