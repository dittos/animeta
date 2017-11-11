package net.animeta.backend.repository

import net.animeta.backend.model.History
import net.animeta.backend.model.Record
import net.animeta.backend.model.Work
import org.springframework.data.querydsl.QueryDslPredicateExecutor
import org.springframework.data.repository.CrudRepository
import java.sql.Timestamp

interface HistoryRepository : CrudRepository<History, Int>, QueryDslPredicateExecutor<History> {
    fun findFirstByRecordOrderByIdDesc(record: Record): History?

    fun countByRecord(record: Record): Int

    fun existsByWorkAndStatusAndUpdatedAtGreaterThan(work: Work, status: String, updatedAt: Timestamp): Boolean
}