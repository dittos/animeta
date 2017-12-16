package net.animeta.backend.repository

import net.animeta.backend.model.TitleMapping
import net.animeta.backend.model.Work
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface TitleMappingRepository : CrudRepository<TitleMapping, Int> {
    fun findOneByTitle(title: String): TitleMapping?
    fun findFirstByKey(key: String): TitleMapping?
    fun countByKeyAndWorkIsNot(key: String, work: Work): Int

    @Modifying
    @Query("update TitleMapping m set m.work = ?2 where m.work = ?1")
    fun replaceWork(fromWork: Work, toWork: Work)
}