package net.animeta.backend.controller.v2

import net.animeta.backend.db.Datastore
import net.animeta.backend.db.query
import net.animeta.backend.dto.PostDTO
import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.History
import net.animeta.backend.model.QRecord.record
import net.animeta.backend.model.Record
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import net.animeta.backend.repository.CategoryRepository
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.PostSerializer
import net.animeta.backend.serializer.RecordSerializer
import net.animeta.backend.service.UserRecordsService
import net.animeta.backend.service.WorkService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.sql.Timestamp
import java.time.Instant
import java.util.Optional
import javax.transaction.Transactional

@RestController
@RequestMapping("/v2/users/{name}/records")
class UserRecordsController(val userRepository: UserRepository,
                            val recordRepository: RecordRepository,
                            val categoryRepository: CategoryRepository,
                            val historyRepository: HistoryRepository,
                            val workService: WorkService,
                            val userRecordsService: UserRecordsService,
                            val datastore: Datastore,
                            val recordSerializer: RecordSerializer,
                            val postSerializer: PostSerializer) {
    data class CreateResponse(val record: RecordDTO, val post: PostDTO)
    data class GetWithCountsResponse(val data: List<RecordDTO>, val counts: UserRecordsService.RecordCounts)

    @GetMapping
    fun get(@PathVariable name: String,
            @CurrentUser(required = false) currentUser: User?,
            @RequestParam("include_has_newer_episode", defaultValue = "false") includeHasNewerEpisodeParam: Boolean,
            @RequestParam("status_type", required = false) statusTypeParam: String?,
            @RequestParam("category_id", required = false) categoryIdParam: Int?,
            @RequestParam(required = false) sort: String?,
            @RequestParam(required = false) limit: Int?,
            @RequestParam("with_counts", defaultValue = "false") withCounts: Boolean,
            @RequestParam(required = false) options: RecordSerializer.Options?): Any {
        val user = userRepository.findByUsername(name) ?: throw ApiException.notFound()
        val includeHasNewerEpisode = includeHasNewerEpisodeParam && currentUser?.id == user.id
        val statusType = if (statusTypeParam != null && statusTypeParam != "") {
            StatusType.valueOf(statusTypeParam.toUpperCase())
        } else {
            null
        }
        var query = record.query.filter(record.user.eq(user))
        if (statusType != null) {
            query = query.filter(record.status_type.eq(statusType))
        }
        val categoryId: Optional<Int>? = categoryIdParam?.let { Optional.of(it) }?.filter { it != 0 }
        if (categoryId != null) {
            query = query.filter(categoryId.map { record.category.id.eq(it) }.orElse(record.category.isNull))
        }
        when (sort) {
            "date", null -> query = query.orderBy(record.updated_at.desc())
            "title" -> query = query.orderBy(record.title.asc())
        }
        if (limit != null) {
            query = query.limit(limit)
        }
        val data = datastore.query(query).map {
            recordSerializer.serialize(it, options ?: RecordSerializer.legacyOptions(includeHasNewerEpisode = includeHasNewerEpisode))
        }
        if (!withCounts) {
            return data
        }
        return GetWithCountsResponse(data, userRecordsService.count(user, statusType, categoryId))
    }

    @PostMapping
    @Transactional
    fun create(
        @PathVariable name: String,
        @CurrentUser currentUser: User,
        @RequestParam("work_title") title: String,
        @RequestParam("category_id", required = false) categoryId: Int?,
        @RequestParam("status_type") statusTypeParam: String,
        @RequestParam(defaultValue = "") status: String,
        @RequestParam(defaultValue = "") comment: String,
        @RequestParam(required = false) rating: Int?
    ): CreateResponse {
        val user = userRepository.findByUsername(name) ?: throw ApiException.notFound()
        if (currentUser.id != user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        if (title.isBlank()) {
            throw ApiException("작품 제목을 입력하세요.", HttpStatus.BAD_REQUEST)
        }
        if (rating != null && rating !in 1..5) {
            throw ApiException("별점은 1부터 5까지 입력할 수 있습니다.", HttpStatus.BAD_REQUEST)
        }
        val work = workService.getOrCreate(title)
        val category = categoryId?.let { categoryRepository.findById(it).orElse(null) }
        if (category != null && currentUser.id != category.user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        val existingRecord = recordRepository.findOneByWorkIdAndUser(work.id!!, user)
        if (existingRecord != null) {
            throw ApiException("이미 같은 작품이 \"${existingRecord.title}\"로 등록되어 있습니다.", HttpStatus.UNPROCESSABLE_ENTITY)
        }
        val statusType = StatusType.valueOf(statusTypeParam.toUpperCase())
        val record = Record(
            user = user,
            workId = work.id!!,
            title = title,
            category = category,
            status = status,
            status_type = statusType,
            updated_at = Timestamp.from(Instant.now()),
            rating = rating
        )
        recordRepository.save(record)
        val history = History(
            user = record.user,
            workId = record.workId,
            record = record,
            status = record.status,
            status_type = record.status_type,
            updatedAt = record.updated_at,
            comment = comment,
            contains_spoiler = false,
            rating = rating
        )
        historyRepository.save(history)
        return CreateResponse(
                record = recordSerializer.serialize(record, RecordSerializer.legacyOptions()),
                post = postSerializer.serialize(history, PostSerializer.legacyOptions())
        )
    }
}
