package net.animeta.backend.repository

import net.animeta.backend.model.History
import net.animeta.backend.model.Record
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.querydsl.QuerydslPredicateExecutor
import org.springframework.data.repository.CrudRepository
import java.sql.Timestamp
import java.util.stream.Stream

interface HistoryRepository : CrudRepository<History, Int>, QuerydslPredicateExecutor<History> {
    fun findFirstByRecordOrderByIdDesc(record: Record): History?

    fun countByRecord(record: Record): Int

    fun countByUser(user: User): Int

    fun existsByWorkIdAndStatusAndUpdatedAtGreaterThan(workId: Int, status: String, updatedAt: Timestamp): Boolean

    fun deleteByUserAndWorkId(user: User, workId: Int)

    @Modifying
    @Query("update History h set h.workId = ?2 where h.workId = ?1")
    fun replaceWorkId(fromWorkId: Int, toWorkId: Int)

    fun streamAllByUserOrderByIdDesc(user: User): Stream<History>

    @Query("""
        SELECT NEW kotlin.Pair(h.status, COUNT(*))
        FROM History h
        WHERE h.workId = ?1
        AND h.comment <> ''
        GROUP BY h.status
    """)
    fun findAllStatusWithCountAndCommentByWorkId(workId: Int): List<Pair<String, Int>>

    @Query("""
        SELECT NEW kotlin.Pair(h.status, COUNT(*))
        FROM History h
        WHERE h.workId = ?1
        AND h.comment = ''
        GROUP BY h.status
    """)
    fun findAllStatusWithCountAndNoCommentByWorkId(workId: Int): List<Pair<String, Int>>

    @Query("""
        SELECT NEW kotlin.Pair(h.status_type, COUNT(DISTINCT h.user))
        FROM History h
        WHERE h.workId = :workId AND h.status = :episode
        GROUP BY h.status_type
    """)
    fun countDistinctUsersByStatusType(workId: Int, episode: String): List<Pair<StatusType, Long>>
}
