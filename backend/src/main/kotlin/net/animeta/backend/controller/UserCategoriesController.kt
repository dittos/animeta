package net.animeta.backend.controller

import net.animeta.backend.dto.CategoryDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.Category
import net.animeta.backend.model.User
import net.animeta.backend.repository.CategoryRepository
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.CategorySerializer
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v2/users/{username}/categories")
class UserCategoriesController(val userRepository: UserRepository,
                               val categoryRepository: CategoryRepository,
                               val categorySerializer: CategorySerializer) {
    @PostMapping
    @Transactional
    fun create(@PathVariable username: String, @CurrentUser currentUser: User, @RequestParam name: String): CategoryDTO {
        val user = userRepository.findByUsername(username) ?: throw ApiException.notFound()
        if (currentUser.id != user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        if (name.isBlank()) {
            throw ApiException("분류 이름을 입력하세요.", HttpStatus.BAD_REQUEST)
        }
        val nextPosition = categoryRepository.findFirstByUserOrderByPositionDesc(user)?.position?.plus(1) ?: 0
        val category = Category(user = user, name = name, position = nextPosition)
        categoryRepository.save(category)
        return categorySerializer.serialize(category)
    }

    @PutMapping
    @Transactional
    fun update(@PathVariable username: String, @CurrentUser currentUser: User, @RequestParam("ids[]") ids: List<Int>): List<CategoryDTO> {
        val user = userRepository.findByUsername(username) ?: throw ApiException.notFound()
        if (currentUser.id != user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        val categoryMap = user.categories.associateBy { it.id }
        if (ids.size != categoryMap.size && ids.toSet() != categoryMap.keys) {
            throw ApiException("분류 정보가 최신이 아닙니다. 새로고침 후 다시 시도해주세요.", HttpStatus.CONFLICT)
        }
        for ((position, id) in ids.withIndex()) {
            val category = categoryMap[id]!!
            category.position = position
            categoryRepository.save(category)
        }
        // categories are not re-fetched so should be sorted manually
        return user.categories.sortedBy { it.position }
                .map { categorySerializer.serialize(it) }
    }
}