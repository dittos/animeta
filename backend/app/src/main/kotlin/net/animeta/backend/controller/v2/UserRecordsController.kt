package net.animeta.backend.controller.v2

import net.animeta.backend.db.Datastore
import net.animeta.backend.db.query
import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.QRecord.record
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.RecordSerializer
import net.animeta.backend.service.UserRecordsService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.Optional

@RestController
@RequestMapping("/v2/users/{name}/records")
class UserRecordsController(val userRepository: UserRepository,
                            val recordRepository: RecordRepository,
                            val historyRepository: HistoryRepository,
                            val userRecordsService: UserRecordsService,
                            val datastore: Datastore,
                            val recordSerializer: RecordSerializer) {
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
}
