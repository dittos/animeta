package net.animeta.backend.controller.v3

import net.animeta.backend.dto.PostDTO
import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.History
import net.animeta.backend.model.Record
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import net.animeta.backend.repository.CategoryRepository
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.PostSerializer
import net.animeta.backend.serializer.RecordSerializer
import net.animeta.backend.service.TweetFormatter
import net.animeta.backend.service.TwitterService
import net.animeta.backend.service.WorkService
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.sql.Timestamp
import java.time.Instant

@RestController
class CreateRecordController(
    private val recordRepository: RecordRepository,
    private val historyRepository: HistoryRepository,
    private val categoryRepository: CategoryRepository,
    private val workService: WorkService,
    private val twitterService: TwitterService,
    private val recordSerializer: RecordSerializer,
    private val postSerializer: PostSerializer
) {
    data class Params(
        val title: String,
        val categoryId: Int?,
        val status: String,
        val statusType: StatusType,
        val comment: String,
        val publishTwitter: Boolean?,
        val rating: Int?,
        val options: RecordSerializer.Options?,
        val postOptions: PostSerializer.Options?
    )
    data class Result(
        val record: RecordDTO?,
        val post: PostDTO?
    )

    @PostMapping("/v3/CreateRecord")
    @Transactional
    fun handle(@RequestBody params: Params, @CurrentUser currentUser: User): Result {
        if (params.title.isBlank()) {
            throw ApiException("작품 제목을 입력하세요.", HttpStatus.BAD_REQUEST)
        }
        if (params.rating != null && params.rating !in 1..5) {
            throw ApiException("별점은 1부터 5까지 입력할 수 있습니다.", HttpStatus.BAD_REQUEST)
        }
        val work = workService.getOrCreate(params.title)
        val category = params.categoryId?.let { categoryRepository.findById(it).orElse(null) }
        if (category != null && currentUser.id != category.user.id) {
            throw ApiException.permissionDenied()
        }
        val existingRecord = recordRepository.findOneByWorkIdAndUser(work.id!!, currentUser)
        if (existingRecord != null) {
            throw ApiException("이미 같은 작품이 \"${existingRecord.title}\"로 등록되어 있습니다.", HttpStatus.UNPROCESSABLE_ENTITY)
        }
        val record = Record(
            user = currentUser,
            workId = work.id!!,
            title = params.title,
            category = category,
            status = params.status,
            status_type = params.statusType,
            updated_at = Timestamp.from(Instant.now()),
            rating = params.rating
        )
        recordRepository.save(record)
        val history = History(
            user = record.user,
            workId = record.workId,
            record = record,
            status = record.status,
            status_type = record.status_type,
            updatedAt = record.updated_at,
            comment = params.comment,
            contains_spoiler = false,
            rating = params.rating
        )
        historyRepository.save(history)

        val publishTwitter = params.publishTwitter ?: false
        if (publishTwitter) {
            // TODO: after commit
            twitterService.updateStatus(currentUser, TweetFormatter.format(history))
        }

        return Result(
            record = params.options?.let { recordSerializer.serialize(record, params.options) },
            post = params.postOptions?.let { postSerializer.serialize(history, params.postOptions) }
        )
    }
}
