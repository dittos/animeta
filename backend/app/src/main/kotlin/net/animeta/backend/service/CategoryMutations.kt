package net.animeta.backend.service

import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.Category
import net.animeta.backend.model.User
import net.animeta.backend.repository.CategoryRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service

@Service
class CategoryMutations(
    private val categoryRepository: CategoryRepository
) {
    @Autowired
    private lateinit var recordMutations: RecordMutations

    fun create(user: User, name: String): Category {
        if (name.isBlank()) {
            throw ApiException("분류 이름을 입력하세요.", HttpStatus.BAD_REQUEST)
        }
        val nextPosition = categoryRepository.findFirstByUserOrderByPositionDesc(user)?.position?.plus(1) ?: 0
        val category = Category(user = user, name = name, position = nextPosition)
        categoryRepository.save(category)
        return category
    }

    fun updateName(category: Category, name: String) {
        if (name.isBlank()) {
            throw ApiException("분류 이름을 입력하세요.", HttpStatus.BAD_REQUEST)
        }
        category.name = name
        categoryRepository.save(category)
    }

    fun updatePositions(user: User, categoryIds: List<Int>): Iterable<Category> {
        val categoryMap = user.categories.associateBy { it.id }
        if (categoryIds.size != categoryMap.size && categoryIds.toSet() != categoryMap.keys) {
            throw ApiException("분류 정보가 최신이 아닙니다. 새로고침 후 다시 시도해주세요.", HttpStatus.CONFLICT)
        }
        return categoryRepository.saveAll(categoryIds.mapIndexed { position, id ->
            val category = categoryMap[id]!!
            category.position = position
            category
        })
    }

    fun delete(category: Category) {
        categoryRepository.delete(category)
        recordMutations.didDeleteCategory(category)
    }
}
