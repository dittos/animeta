package net.animeta.backend.controller.v2

import net.animeta.backend.dto.PostDTO
import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.History
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.PostSerializer
import net.animeta.backend.serializer.RecordSerializer
import net.animeta.backend.service.TwitterService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.sql.Timestamp
import java.time.Instant
import javax.transaction.Transactional

@RestController
@RequestMapping("/v2/records/{id}/posts")
class RecordPostsController(val recordRepository: RecordRepository,
                            val historyRepository: HistoryRepository,
                            val recordSerializer: RecordSerializer,
                            val postSerializer: PostSerializer,
                            val twitterService: TwitterService) {
    data class GetResponse(val posts: List<PostDTO>)
    data class CreateResponse(val record: RecordDTO, val post: PostDTO)

    @GetMapping
    fun get(@PathVariable id: Int,
            @RequestParam(required = false) options: PostSerializer.Options?): GetResponse {
        val record = recordRepository.findById(id).orElseThrow { ApiException.notFound() }
        val posts = record.histories
        return GetResponse(posts.map { postSerializer.serialize(it, options ?: PostSerializer.legacyOptions()) })
    }

    @PostMapping
    @Transactional
    fun create(@PathVariable id: Int,
               @CurrentUser currentUser: User,
               @RequestParam status: String,
               @RequestParam("status_type") statusTypeParam: String,
               @RequestParam comment: String,
               @RequestParam("contains_spoiler", defaultValue = "false") containsSpoiler: Boolean,
               @RequestParam("publish_twitter", defaultValue = "false") publishTwitter: Boolean): CreateResponse {
        val record = recordRepository.findById(id).orElseThrow { ApiException.notFound() }
        if (currentUser.id != record.user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        val statusType = StatusType.valueOf(statusTypeParam.toUpperCase())
        val history = History(
                user = currentUser,
                workId = record.workId,
                record = record,
                status = status,
                status_type = statusType,
                comment = comment,
                contains_spoiler = containsSpoiler,
                updatedAt = Timestamp.from(Instant.now())
        )
        historyRepository.save(history)
        record.status_type = history.status_type
        record.status = history.status
        record.updated_at = history.updatedAt
        recordRepository.save(record)

        if (publishTwitter) {
            twitterService.postToTwitter(currentUser, history)
        }

        return CreateResponse(
                record = recordSerializer.serialize(record, RecordSerializer.legacyOptions()),
                post = postSerializer.serialize(history, PostSerializer.legacyOptions())
        )
    }
}
