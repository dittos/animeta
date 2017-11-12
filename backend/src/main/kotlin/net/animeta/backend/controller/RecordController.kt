package net.animeta.backend.controller

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
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v2/records/{id}")
class RecordController(val recordRepository: RecordRepository,
                       val categoryRepository: CategoryRepository,
                       val recordSerializer: RecordSerializer,
                       val workService: WorkService) {
    @GetMapping
    fun get(@PathVariable id: Int): RecordDTO {
        val record = recordRepository.findOne(id) ?: throw ApiException.notFound()
        return recordSerializer.serialize(record, includeUser = true)
    }

    @PostMapping
    @Transactional
    fun update(@PathVariable id: Int, @CurrentUser currentUser: User,
               @RequestParam(required = false) title: String?,
               @RequestParam("category_id", required = false) categoryIdParam: String?): RecordDTO {
        val record = recordRepository.findOne(id) ?: throw ApiException.notFound()
        if (currentUser.id != record.user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        if (title != null) {
            val work = workService.getOrCreate(title)
            record.work = work
            record.histories.forEach { it.work = work }
            record.title = title
        }
        if (categoryIdParam != null) {
            val categoryId = categoryIdParam.toIntOrNull()
            if (categoryId != null) {
                val category = categoryRepository.findOne(categoryId)
                if (category.user.id != record.user.id) {
                    throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
                }
                record.category = category
            } else {
                record.category = null
            }
        }
        recordRepository.save(record)
        return recordSerializer.serialize(record, includeUser = true)
    }

    data class DeleteResponse(val ok: Boolean)

    @DeleteMapping
    @Transactional
    fun delete(@PathVariable id: Int, @CurrentUser currentUser: User): DeleteResponse {
        val record = recordRepository.findOne(id) ?: throw ApiException.notFound()
        if (currentUser.id != record.user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        recordRepository.delete(record)
        return DeleteResponse(true)
    }
}