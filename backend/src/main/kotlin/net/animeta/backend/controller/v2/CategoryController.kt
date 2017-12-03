package net.animeta.backend.controller.v2

import net.animeta.backend.dto.CategoryDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.CategoryRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.CategorySerializer
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v2/categories/{id}")
class CategoryController(val categoryRepository: CategoryRepository,
                         val recordRepository: RecordRepository,
                         val categorySerializer: CategorySerializer) {
    data class DeleteResponse(val ok: Boolean)

    @DeleteMapping
    @Transactional
    fun delete(@PathVariable id: Int, @CurrentUser currentUser: User): DeleteResponse {
        val category = categoryRepository.findOne(id) ?: throw ApiException.notFound()
        if (currentUser.id != category.user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        recordRepository.unsetCategory(category)
        categoryRepository.delete(category)
        return DeleteResponse(true)
    }

    @PostMapping
    @Transactional
    fun update(@PathVariable id: Int, @CurrentUser currentUser: User, @RequestParam name: String): CategoryDTO {
        val category = categoryRepository.findOne(id) ?: throw ApiException.notFound()
        if (currentUser.id != category.user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        if (name.isBlank()) {
            throw ApiException("분류 이름을 입력하세요.", HttpStatus.BAD_REQUEST)
        }
        category.name = name
        categoryRepository.save(category)
        return categorySerializer.serialize(category)
    }
}