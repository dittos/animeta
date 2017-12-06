package net.animeta.backend.controller.admin

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import net.animeta.backend.db.Datastore
import net.animeta.backend.db.query
import net.animeta.backend.dto.WorkDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.QUser.user
import net.animeta.backend.model.QWork.work
import net.animeta.backend.model.TitleMapping
import net.animeta.backend.model.User
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.repository.TitleMappingRepository
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.WorkSerializer
import net.animeta.backend.service.WorkService
import net.animeta.backend.service.admin.ImageService
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/admin")
class AdminController(private val datastore: Datastore,
                      private val workService: WorkService,
                      private val imageService: ImageService,
                      private val workRepository: WorkRepository,
                      private val recordRepository: RecordRepository,
                      private val titleMappingRepository: TitleMappingRepository,
                      private val historyRepository: HistoryRepository,
                      private val workSerializer: WorkSerializer,
                      private val objectMapper: ObjectMapper) {
    @GetMapping("/works")
    fun getWorks(@CurrentUser currentUser: User,
                 @RequestParam("orphans", defaultValue = "false") onlyOrphans: Boolean,
                 @RequestParam(defaultValue = "0") offset: Int): List<WorkDTO> {
        checkPermission(currentUser)

        var query = work.query.filter(work.blacklisted.isFalse)
        if (onlyOrphans) {
            query = query.filter(work.indexes.any().record_count.eq(0))
        }
        query = query.orderBy(work.id.desc()).offset(offset).limit(50)
        return datastore.query(query).map { workSerializer.serialize(it) }
    }

    data class CreateWorkRequest(val title: String)

    @PostMapping("/works")
    fun createWork(@CurrentUser currentUser: User,
                   @RequestBody request: CreateWorkRequest): WorkDTO {
        checkPermission(currentUser)
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
            val raw_metadata: String,
            val metadata: JsonNode?,
            val title_mappings: List<TitleMappingDTO>,
            val index: AdminWorkIndexDTO?
    )

    @GetMapping("/works/{id}")
    fun getWork(@CurrentUser currentUser: User,
                @PathVariable id: Int): AdminWorkDTO {
        checkPermission(currentUser)
        val work = workRepository.findOne(id)
        val titleMappings = work.titleMappings.map {
            TitleMappingDTO(
                    id = it.id!!,
                    title = it.title,
                    record_count = recordRepository.countByTitle(it.title)
            )
        }.sortedByDescending { it.record_count }
        val index = work.indexes.firstOrNull()
        return AdminWorkDTO(
                id = work.id!!,
                title = work.title,
                image_filename = work.image_filename,
                image_path = workSerializer.getImagePath(work),
                raw_metadata = work.raw_metadata ?: "",
                metadata = work.metadata?.let { objectMapper.readTree(it) },
                title_mappings = titleMappings,
                index = index?.let { AdminWorkIndexDTO(record_count = it.record_count, rank = it.rank) }
        )
    }

    data class CrawlImageOptions(val source: String, val annId: String?, val url: String?)
    data class EditWorkRequest(val primaryTitleMappingId: Int?,
                               val mergeWorkId: Int?,
                               val forceMerge: Boolean?,
                               val rawMetadata: String?,
                               val crawlImage: CrawlImageOptions?,
                               val blacklisted: Boolean?)

    @PostMapping("/works/{id}")
    @Transactional
    fun editWork(@CurrentUser currentUser: User,
                 @PathVariable id: Int,
                 @RequestBody request: EditWorkRequest): AdminWorkDTO {
        checkPermission(currentUser)
        if (request.primaryTitleMappingId != null) {
            setPrimaryTitleMapping(request.primaryTitleMappingId)
        }
        if (request.mergeWorkId != null) {
            merge(id, request.mergeWorkId, request.forceMerge ?: false)
        }
        if (request.rawMetadata != null) {
            editMetadata(id, request.rawMetadata)
        }
        if (request.crawlImage != null) {
            crawlImage(id, request.crawlImage)
        }
        return getWork(currentUser, id)
    }

    private fun setPrimaryTitleMapping(primaryTitleMappingId: Int) {
        val mapping = titleMappingRepository.findOne(primaryTitleMappingId)
        mapping.work.title = mapping.title
        workRepository.save(mapping.work)
    }

    data class MergeError(val conflicts: List<MergeConflictDTO>)
    data class MergeConflictDTO(val user_id: Int, val username: String, val ids: List<Int>)

    private fun merge(workId: Int, otherWorkId: Int, force: Boolean) {
        val work = workRepository.findOne(workId)
        val other = workRepository.findOne(otherWorkId)
        if (work.id == other.id) {
            throw ApiException("Cannot merge itself", HttpStatus.BAD_REQUEST)
        }
        val conflicts = datastore.query(user.query.filter(user.records.any().work.eq(work)
                .and(user.records.any().work.eq(other))))
        if (conflicts.isNotEmpty() && !force) {
            throw ApiException("Users with conflict exist", HttpStatus.UNPROCESSABLE_ENTITY,
                    MergeError(conflicts = conflicts.map { MergeConflictDTO(
                            user_id = it.id!!,
                            username = it.username,
                            ids = it.records.filter { it.work.id == work.id || it.work.id == other.id }.map { it.id!! }
                    ) }))
        }
        for (u in conflicts) {
            historyRepository.deleteByUserAndWork(u, other)
            recordRepository.deleteByUserAndWork(u, other)
        }
        titleMappingRepository.replaceWork(other, work)
        historyRepository.replaceWork(other, work)
        recordRepository.replaceWork(other, work)
        workRepository.delete(other)
    }

    private fun editMetadata(id: Int, rawMetadata: String) {
        val work = workRepository.findOne(id)
        var metadata: JsonNode
        try {
            metadata = ObjectMapper(YAMLFactory()).readTree(rawMetadata)
        } catch (e: Exception) {
            throw ApiException("YAML parse failed: ${e.message}", HttpStatus.BAD_REQUEST)
        }
        work.raw_metadata = rawMetadata
        work.metadata = objectMapper.writeValueAsString(metadata)
        workRepository.save(work)
    }

    private fun crawlImage(id: Int, options: CrawlImageOptions) {
        val work = workRepository.findOne(id)
        when (options.source) {
            "ann" -> {
                work.original_image_filename = imageService.downloadAnnPoster(options.annId!!)
                work.image_filename = imageService.generateThumbnail(work.original_image_filename!!, removeAnnWatermark = true)
                workRepository.save(work)
            }
            "url" -> {
                work.original_image_filename = imageService.downloadPoster(options.url!!)
                work.image_filename = imageService.generateThumbnail(work.original_image_filename!!)
                workRepository.save(work)
            }
        }
    }

    data class DeleteResponse(val ok: Boolean)

    @DeleteMapping("/works/{id}")
    @Transactional
    fun deleteWork(@CurrentUser currentUser: User,
                   @PathVariable id: Int): DeleteResponse {
        checkPermission(currentUser)
        val work = workRepository.findOne(id)
        if (recordRepository.countByWork(work) != 0) {
            throw ApiException("Record exists", HttpStatus.FORBIDDEN)
        }
        workRepository.delete(work)
        return DeleteResponse(true)
    }

    data class AddTitleMappingRequest(val title: String)

    @PostMapping("/works/{id}/title-mappings")
    @Transactional
    fun addTitleMapping(@CurrentUser currentUser: User,
                        @PathVariable id: Int,
                        @RequestBody request: AddTitleMappingRequest): TitleMappingDTO {
        checkPermission(currentUser)
        val work = workRepository.findOne(id)
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
    fun deleteTitleMapping(@CurrentUser currentUser: User, @PathVariable id: Int): DeleteResponse {
        checkPermission(currentUser)
        val mapping = titleMappingRepository.findOne(id)
        if (recordRepository.countByTitle(mapping.title) > 0) {
            throw ApiException("Record exists", HttpStatus.FORBIDDEN)
        }
        titleMappingRepository.delete(mapping)
        return DeleteResponse(true)
    }

    private fun checkPermission(user: User) {
        if (!user.staff) {
            throw ApiException("Staff permission required.", HttpStatus.UNAUTHORIZED)
        }
    }
}