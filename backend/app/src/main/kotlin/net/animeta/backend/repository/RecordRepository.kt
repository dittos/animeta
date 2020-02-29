package net.animeta.backend.repository

import com.google.common.annotations.VisibleForTesting
import net.animeta.backend.model.Category
import net.animeta.backend.model.Record
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface RecordRepository : CrudRepository<Record, Int> {
    fun countByWorkId(workId: Int): Int

    fun countByTitle(title: String): Int

    fun countByUser(user: User): Int

    fun findOneByWorkIdAndUser(workId: Int, user: User): Record?

    @VisibleForTesting
    fun findAllByUser(user: User): List<Record>

    fun findAllByUserAndWorkIdIn(user: User, workIds: Collection<Int>): List<Record>

    @Modifying
    @Query("update Record r set r.category = NULL where r.category = ?1")
    fun unsetCategory(category: Category): Int

    fun deleteByUserAndWorkId(user: User, workId: Int)

    @Modifying
    @Query("update Record r set r.workId = ?2 where r.workId = ?1")
    fun replaceWorkId(fromWorkId: Int, toWorkId: Int)

    @Query("""
        SELECT NEW net.animeta.backend.repository.RecordRepository${'$'}CountGroupRow(r.status_type, r.category.id, COUNT(*))
        FROM Record r
        WHERE r.user = ?1
        GROUP BY r.status_type, r.category.id
    """)
    fun countGroupsByUser(user: User): List<CountGroupRow>

    data class CountGroupRow(val statusType: StatusType, val categoryId: Int?, val count: Long)

    @Query("""
        SELECT NEW kotlin.Pair(r, r2)
        FROM Record r
        JOIN Record r2 ON r.user = r2.user
        WHERE r.workId = :workId AND r2.workId = :otherWorkId
    """)
    fun findConflictingRecords(workId: Int, otherWorkId: Int): List<Pair<Record, Record>>
}
