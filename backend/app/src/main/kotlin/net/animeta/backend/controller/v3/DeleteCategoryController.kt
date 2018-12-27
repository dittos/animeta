package net.animeta.backend.controller.v3

import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.CategoryRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.security.CurrentUser
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class DeleteCategoryController(
    private val categoryRepository: CategoryRepository,
    private val recordRepository: RecordRepository
) {
    data class Params(
        val id: Int
    )
    data class Result(
        val ok: Boolean
    )

    @PostMapping("/v3/DeleteCategory")
    @Transactional
    fun handle(@RequestBody params: Params, @CurrentUser currentUser: User): Result {
        val category = categoryRepository.findById(params.id).orElseThrow { ApiException.notFound() }
        if (currentUser.id != category.user.id) {
            throw ApiException.permissionDenied()
        }
        recordRepository.unsetCategory(category)
        categoryRepository.delete(category)
        return Result(true)
    }
}