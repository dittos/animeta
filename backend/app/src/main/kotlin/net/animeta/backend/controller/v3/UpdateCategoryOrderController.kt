package net.animeta.backend.controller.v3

import net.animeta.backend.dto.CategoryDTO
import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.CategorySerializer
import net.animeta.backend.service.CategoryMutations
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class UpdateCategoryOrderController(
    private val categoryMutations: CategoryMutations,
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
        val updatedCategories = categoryMutations.updatePositions(currentUser, params.categoryIds)
        return Result(updatedCategories.map { categorySerializer.serialize(it) })
    }
}
