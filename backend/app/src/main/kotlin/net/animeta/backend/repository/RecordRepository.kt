package net.animeta.backend.repository

import net.animeta.backend.model.*
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

    @Query("""
        SELECT NEW net.animeta.backend.repository.RecordRepository${'$'}CountGroupRow(r.status_type, r.category.id, COUNT(*))
        FROM Record r
        WHERE r.user = ?1
        GROUP BY r.status_type, r.category.id
    """)
    fun countGroupsByUser(user: User): List<CountGroupRow>

    data class CountGroupRow(val statusType: StatusType, val categoryId: Int?, val count: Long)
}
