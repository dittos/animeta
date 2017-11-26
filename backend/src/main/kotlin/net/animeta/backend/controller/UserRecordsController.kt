package net.animeta.backend.controller

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
import net.animeta.backend.service.WorkService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import java.sql.Timestamp
import java.time.Instant
import javax.transaction.Transactional

@RestController
@RequestMapping("/v2/users/{name}/records")
class UserRecordsController(val userRepository: UserRepository,
                            val recordRepository: RecordRepository,
                            val categoryRepository: CategoryRepository,
                            val historyRepository: HistoryRepository,
                            val workService: WorkService,
                            val datastore: Datastore,
                            val recordSerializer: RecordSerializer,
                            val postSerializer: PostSerializer) {
    data class CreateResponse(val record: RecordDTO, val post: PostDTO)

    @GetMapping
    fun get(@PathVariable name: String,
            @CurrentUser(required = false) currentUser: User?,
            @RequestParam("include_has_newer_episode", defaultValue = "false") includeHasNewerEpisodeParam: Boolean,
            @RequestParam("status_type", required = false) statusTypeParam: String?,
            @RequestParam(required = false) sort: String?,
            @RequestParam(required = false) limit: Int?): List<RecordDTO> {
        val user = userRepository.findByUsername(name) ?: throw ApiException.notFound()
        val includeHasNewerEpisode = includeHasNewerEpisodeParam && currentUser?.id == user.id
        val statusType = statusTypeParam?.toUpperCase()?.let { StatusType.valueOf(it) }
        var query = record.query.filter(record.user.eq(user))
        if (statusType != null) {
            query = query.filter(record.status_type.eq(statusType))
        }
        when (sort) {
            "date", null -> query = query.orderBy(record.updated_at.desc())
            "title" -> query = query.orderBy(record.title.asc())
        }
        if (limit != null) {
            query = query.limit(limit)
        }
        return datastore.query(query).map { recordSerializer.serialize(it, includeHasNewerEpisode = includeHasNewerEpisode) }
    }

    @PostMapping
    @Transactional
    fun post(@PathVariable name: String,
             @CurrentUser currentUser: User,
             @RequestParam("work_title") title: String,
             @RequestParam("category_id", required = false) categoryId: Int?,
             @RequestParam("status_type") statusTypeParam: String): CreateResponse {
        val user = userRepository.findByUsername(name) ?: throw ApiException.notFound()
        if (currentUser.id != user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        if (title.isBlank()) {
            throw ApiException("작품 제목을 입력하세요.", HttpStatus.BAD_REQUEST)
        }
        val work = workService.getOrCreate(title)
        val category = categoryId?.let { categoryRepository.findOne(it) }
        if (category != null && currentUser.id != category.user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        val existingRecord = recordRepository.findOneByWorkAndUser(work, user)
        if (existingRecord != null) {
            throw ApiException("이미 같은 작품이 \"${existingRecord.title}\"로 등록되어 있습니다.", HttpStatus.UNPROCESSABLE_ENTITY)
        }
        val statusType = StatusType.valueOf(statusTypeParam.toUpperCase())
        val record = Record(
                user = user,
                work = work,
                title = title,
                category = category,
                status = "",
                status_type = statusType,
                updated_at = Timestamp.from(Instant.now())
        )
        recordRepository.save(record)
        val history = History(
                user = record.user,
                work = record.work,
                record = record,
                status = record.status,
                status_type = record.status_type,
                updatedAt = record.updated_at,
                comment = "",
                contains_spoiler = false
        )
        historyRepository.save(history)
        return CreateResponse(
                record = recordSerializer.serialize(record),
                post = postSerializer.serialize(history)
        )
    }
}