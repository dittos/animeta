package net.animeta.backend.repository

import net.animeta.backend.model.History
import net.animeta.backend.model.Record
import net.animeta.backend.model.User
import net.animeta.backend.model.Work
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.querydsl.QueryDslPredicateExecutor
import org.springframework.data.repository.CrudRepository
import java.sql.Timestamp
import java.util.stream.Stream

interface HistoryRepository : CrudRepository<History, Int>, QueryDslPredicateExecutor<History> {
    fun findFirstByRecordOrderByIdDesc(record: Record): History?

    fun countByRecord(record: Record): Int

    fun countByUser(user: User): Int

    fun existsByWorkAndStatusAndUpdatedAtGreaterThan(work: Work, status: String, updatedAt: Timestamp): Boolean

    fun deleteByUserAndWork(user: User, work: Work)

    @Modifying
    @Query("update History h set h.work = ?2 where h.work = ?1")
    fun replaceWork(fromWork: Work, toWork: Work)

    fun streamAllByUserOrderByIdDesc(user: User): Stream<History>

    @Query("""
        SELECT NEW kotlin.Pair(h.status, COUNT(*))
        FROM History h
        WHERE h.work = ?1
        AND h.comment <> ''
        GROUP BY h.status
    """)
    fun findAllStatusWithCountAndCommentByWork(work: Work): List<Pair<String, Int>>

    @Query("""
        SELECT NEW kotlin.Pair(h.status, COUNT(*))
        FROM History h
        WHERE h.work = ?1
        AND h.comment = ''
        GROUP BY h.status
    """)
    fun findAllStatusWithCountAndNoCommentByWork(work: Work): List<Pair<String, Int>>
}
