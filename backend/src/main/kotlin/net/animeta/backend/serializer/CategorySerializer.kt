package net.animeta.backend.serializer

import net.animeta.backend.dto.CategoryDTO
import net.animeta.backend.model.Category
import org.springframework.stereotype.Service

@Service
class CategorySerializer {
    fun serialize(category: Category) =
        CategoryDTO(id = category.id, name = category.name)
}