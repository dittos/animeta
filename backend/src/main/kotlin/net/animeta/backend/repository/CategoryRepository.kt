package net.animeta.backend.repository

import net.animeta.backend.model.Category
import net.animeta.backend.model.User
import org.springframework.data.repository.CrudRepository

interface CategoryRepository : CrudRepository<Category, Int> {
    fun findFirstByUserOrderByPositionDesc(user: User): Category?
}