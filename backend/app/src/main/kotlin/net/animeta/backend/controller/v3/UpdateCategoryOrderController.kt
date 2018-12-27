package net.animeta.backend.controller.v3

import net.animeta.backend.dto.CategoryDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.CategoryRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.CategorySerializer
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class UpdateCategoryOrderController(
    private val categoryRepository: CategoryRepository,
    private val categorySerializer: CategorySerializer
) {
    data class Params(
        val categoryIds: List<Int>
    )
    data class Result(
        val categories: List<CategoryDTO>
    )

    @PostMapping("/v3/UpdateCategoryOrder")
    fun handle(@RequestBody params: Params, @CurrentUser currentUser: User): Result {
        val categoryMap = currentUser.categories.associateBy { it.id }
        if (params.categoryIds.size != categoryMap.size && params.categoryIds.toSet() != categoryMap.keys) {
            throw ApiException("분류 정보가 최신이 아닙니다. 새로고침 후 다시 시도해주세요.", HttpStatus.CONFLICT)
        }
        for ((position, id) in params.categoryIds.withIndex()) {
            val category = categoryMap[id]!!
            category.position = position
            categoryRepository.save(category)
        }
        // categories are not re-fetched so should be sorted manually
        return Result(currentUser.categories.sortedBy { it.position }
            .map { categorySerializer.serialize(it) })
    }
}