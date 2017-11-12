package net.animeta.backend.controller

import com.querydsl.jpa.HQLTemplates
import com.querydsl.jpa.impl.JPAQuery
import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.QRecord.record
import net.animeta.backend.model.Record
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.RecordSerializer
import org.springframework.web.bind.annotation.*
import javax.persistence.EntityManager

@RestController
@RequestMapping("/v2/users/{name}/records")
class UserRecordsController(val userRepository: UserRepository,
                            val entityManager: EntityManager,
                            val recordSerializer: RecordSerializer) {
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
        val query = JPAQuery<Record>(entityManager, HQLTemplates.DEFAULT)
                .select(record).from(record)
                .where(record.user.eq(user))
        if (statusType != null) {
            query.where(record.status_type.eq(statusType))
        }
        when (sort) {
            "date", null -> query.orderBy(record.updated_at.desc())
            "title" -> query.orderBy(record.title.asc())
        }
        if (limit != null) {
            query.limit(limit.toLong())
        }
        return query.fetch().map { recordSerializer.serialize(it, includeHasNewerEpisode = includeHasNewerEpisode) }
    }
}