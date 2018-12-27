package net.animeta.backend.controller.v3

import net.animeta.backend.dto.CategoryDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.CategoryRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.CategorySerializer
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class UpdateCategoryController(
    private val categoryRepository: CategoryRepository,
    private val categorySerializer: CategorySerializer
) {
    data class Params(
        val id: Int,
        val name: String?
    )
    data class Result(
        val category: CategoryDTO
    )

    @PostMapping("/v3/UpdateCategory")
    @Transactional
    fun handle(@RequestBody params: Params, @CurrentUser currentUser: User): Result {
        val category = categoryRepository.findById(params.id).orElseThrow { ApiException.notFound() }
        if (currentUser.id != category.user.id) {
            throw ApiException.permissionDenied()
        }
        if (params.name != null) {
            if (params.name.isBlank()) {
                throw ApiException("분류 이름을 입력하세요.", HttpStatus.BAD_REQUEST)
            }
            category.name = params.name
        }
        categoryRepository.save(category)
        return Result(categorySerializer.serialize(category))
    }
}