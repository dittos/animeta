package net.animeta.backend.controller.v3

import net.animeta.backend.dto.PostDTO
import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import net.animeta.backend.repository.CategoryRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.PostSerializer
import net.animeta.backend.serializer.RecordSerializer
import net.animeta.backend.service.RecordMutations
import net.animeta.backend.service.TweetFormatter
import net.animeta.backend.service.TwitterService
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class CreateRecordController(
    private val categoryRepository: CategoryRepository,
    private val recordMutations: RecordMutations,
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
        val category = params.categoryId?.let { categoryRepository.findById(it).orElse(null) }
        if (category != null && currentUser.id != category.user.id) {
            throw ApiException.permissionDenied()
        }
        val result = recordMutations.create(
            user = currentUser,
            title = params.title,
            status = params.status,
            statusType = params.statusType,
            comment = params.comment,
            containsSpoiler = false,
            rating = params.rating,
            category = category
        )

        val publishTwitter = params.publishTwitter ?: false
        if (publishTwitter) {
            // TODO: after commit
            twitterService.updateStatus(currentUser, TweetFormatter.format(result.history))
        }

        return Result(
            record = params.options?.let { recordSerializer.serialize(result.record, params.options) },
            post = params.postOptions?.let { postSerializer.serialize(result.history, params.postOptions) }
        )
    }
}
