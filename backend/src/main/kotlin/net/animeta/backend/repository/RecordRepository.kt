package net.animeta.backend.repository

import net.animeta.backend.model.Category
import net.animeta.backend.model.Record
import net.animeta.backend.model.User
import net.animeta.backend.model.Work
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface RecordRepository : CrudRepository<Record, Int> {
    fun countByWork(work: Work): Int

    fun countByTitle(title: String): Int

    fun countByUser(user: User): Int

    fun findOneByWorkAndUser(work: Work, user: User): Record?

    fun findAllByUserAndWorkIdIn(user: User, workIds: Iterable<Int>): List<Record>

    @Modifying
    @Query("update Record r set r.category = NULL where r.category = ?1")
    fun unsetCategory(category: Category): Int

    fun deleteByUserAndWork(user: User, work: Work)

    @Modifying
    @Query("update Record r set r.work = ?2 where r.work = ?1")
    fun replaceWork(fromWork: Work, toWork: Work)
}