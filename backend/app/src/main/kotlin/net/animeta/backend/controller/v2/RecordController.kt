package net.animeta.backend.controller.v2

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
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/records/{id}")
class RecordController(val recordRepository: RecordRepository,
                       val categoryRepository: CategoryRepository,
                       val recordSerializer: RecordSerializer,
                       val workService: WorkService) {
    @GetMapping
    fun get(@PathVariable id: Int,
            @RequestParam(defaultValue = "{}") options: RecordSerializer.Options): RecordDTO {
        val record = recordRepository.findById(id).orElseThrow { ApiException.notFound() }
        return recordSerializer.serialize(record, options)
    }

    @PostMapping
    @Transactional
    fun update(
        @PathVariable id: Int,
        @CurrentUser currentUser: User,
        @RequestParam(required = false) title: String?,
        @RequestParam("category_id", required = false) categoryIdParam: String?,
        @RequestParam(required = false) rating: Int?,
        @RequestParam(defaultValue = "false") ratingIsSet: Boolean
    ): RecordDTO {
        val record = recordRepository.findById(id).orElseThrow { ApiException.notFound() }
        if (currentUser.id != record.user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        if (title != null) {
            val work = workService.getOrCreate(title)
            record.workId = work.id!!
            record.histories.forEach { it.workId = work.id!! }
            record.title = title
        }
        if (categoryIdParam != null) {
            val categoryId = categoryIdParam.toIntOrNull()
            if (categoryId != null) {
                val category = categoryRepository.findById(categoryId).orElse(null)
                if (category.user.id != record.user.id) {
                    throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
                }
                record.category = category
            } else {
                record.category = null
            }
        }
        if (ratingIsSet) {
            if (rating != null && rating !in 1..5) {
                throw ApiException("별점은 1부터 5까지 입력할 수 있습니다.", HttpStatus.BAD_REQUEST)
            }
            record.rating = rating
        }
        recordRepository.save(record)
        return recordSerializer.serialize(record, RecordSerializer.legacyOptions(includeUser = true))
    }

    data class DeleteResponse(val ok: Boolean)

    @DeleteMapping
    @Transactional
    @Deprecated("v3")
    fun delete(@PathVariable id: Int, @CurrentUser currentUser: User): DeleteResponse {
        val record = recordRepository.findById(id).orElseThrow { ApiException.notFound() }
        if (currentUser.id != record.user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        recordRepository.delete(record)
        return DeleteResponse(true)
    }
}
