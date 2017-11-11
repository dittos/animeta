package net.animeta.backend.repository

import net.animeta.backend.model.TitleMapping
import org.springframework.data.repository.CrudRepository

interface TitleMappingRepository : CrudRepository<TitleMapping, Int> {
    fun findOneByTitle(title: String): TitleMapping?
}