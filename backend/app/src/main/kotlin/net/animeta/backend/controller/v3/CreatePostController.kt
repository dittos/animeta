package net.animeta.backend.controller.v3

import net.animeta.backend.dto.PostDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.History
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.PostSerializer
import net.animeta.backend.service.TweetFormatter
import net.animeta.backend.service.TwitterService
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.sql.Timestamp
import java.time.Instant

@RestController
class CreatePostController(
    private val recordRepository: RecordRepository,
    private val historyRepository: HistoryRepository,
    private val twitterService: TwitterService,
    private val postSerializer: PostSerializer
) {
    data class Params(
        val recordId: Int,
        val status: String,
        val statusType: StatusType,
        val comment: String,
        val containsSpoiler: Boolean,
        val publishTwitter: Boolean,
        val rating: Int?,
        val options: PostSerializer.Options?
    )
    data class Result(
        val post: PostDTO?
    )

    @PostMapping("/v3/CreatePost")
    @Transactional
    fun handle(@RequestBody params: Params, @CurrentUser currentUser: User): Result {
        val record = recordRepository.findById(params.recordId).orElseThrow { ApiException.notFound() }
        if (currentUser.id != record.user.id) {
            throw ApiException.permissionDenied()
        }
        if (params.rating != null && params.rating !in 1..5) {
            throw ApiException("별점은 1부터 5까지 입력할 수 있습니다.", HttpStatus.BAD_REQUEST)
        }
        val history = History(
            user = currentUser,
            workId = record.workId,
            record = record,
            status = params.status,
            status_type = params.statusType,
            comment = params.comment,
            contains_spoiler = params.containsSpoiler,
            updatedAt = Instant.now(),
            rating = params.rating
        )
        historyRepository.save(history)
        record.status_type = history.status_type
        record.status = history.status
        record.updated_at = history.updatedAt
        recordRepository.save(record)

        if (params.publishTwitter) {
            // TODO: after commit
            twitterService.updateStatus(currentUser, TweetFormatter.format(history))
        }

        return Result(
            post = params.options?.let { postSerializer.serialize(history, params.options) }
        )
    }
}