package net.animeta.backend.controller.v3

import net.animeta.backend.dto.CategoryDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.Category
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
class CreateCategoryController(
    private val categoryRepository: CategoryRepository,
    private val categorySerializer: CategorySerializer
) {
    data class Params(
        val name: String
    )
    data class Result(
        val category: CategoryDTO
    )

    @PostMapping("/v3/CreateCategory")
    @Transactional
    fun handle(@RequestBody params: Params, @CurrentUser currentUser: User): Result {
        if (params.name.isBlank()) {
            throw ApiException("분류 이름을 입력하세요.", HttpStatus.BAD_REQUEST)
        }
        val nextPosition = categoryRepository.findFirstByUserOrderByPositionDesc(currentUser)?.position?.plus(1) ?: 0
        val category = Category(user = currentUser, name = params.name, position = nextPosition)
        categoryRepository.save(category)
        return Result(categorySerializer.serialize(category))
    }
}