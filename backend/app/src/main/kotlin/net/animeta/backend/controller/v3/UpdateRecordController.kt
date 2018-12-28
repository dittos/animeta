package net.animeta.backend.controller.v3

import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.CategoryRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.RecordSerializer
import net.animeta.backend.service.WorkService
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class UpdateRecordController(
    private val recordRepository: RecordRepository,
    private val categoryRepository: CategoryRepository,
    private val recordSerializer: RecordSerializer,
    private val workService: WorkService
) {
    data class Params(
        val id: Int,
        val title: String?,
        val categoryId: Int?,
        val categoryIdIsSet: Boolean,
        val rating: Int?,
        val ratingIsSet: Boolean,
        val options: RecordSerializer.Options?
    )
    data class Result(
        val record: RecordDTO?
    )

    @PostMapping("/v3/UpdateRecord")
    @Transactional
    fun handle(@RequestBody params: Params, @CurrentUser currentUser: User): Result {
        val record = recordRepository.findById(params.id).orElseThrow { ApiException.notFound() }
        if (currentUser.id != record.user.id) {
            throw ApiException.permissionDenied()
        }
        if (params.title != null) {
            val work = workService.getOrCreate(params.title)
            record.workId = work.id!!
            record.histories.forEach { it.workId = work.id!! }
            record.title = params.title
        }
        if (params.categoryIdIsSet) {
            if (params.categoryId != null) {
                val category = categoryRepository.findById(params.categoryId).orElse(null)
                if (category.user.id != record.user.id) {
                    throw ApiException.permissionDenied()
                }
                record.category = category
            } else {
                record.category = null
            }
        }
        if (params.ratingIsSet) {
            if (params.rating != null && params.rating !in 1..5) {
                throw ApiException("별점은 1부터 5까지 입력할 수 있습니다.", HttpStatus.BAD_REQUEST)
            }
            record.rating = params.rating
        }
        recordRepository.save(record)
        return Result(
            record = params.options?.let { recordSerializer.serialize(record, params.options) }
        )
    }
}
