package net.animeta.backend.controller.v3

import net.animeta.backend.dto.CategoryDTO
import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.CategorySerializer
import net.animeta.backend.service.CategoryMutations
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class CreateCategoryController(
    private val categoryMutations: CategoryMutations,
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
        val category = categoryMutations.create(currentUser, params.name)
        return Result(categorySerializer.serialize(category))
    }
}