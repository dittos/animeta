package net.animeta.backend.repository

import net.animeta.backend.model.History
import net.animeta.backend.model.Record
import org.springframework.data.querydsl.QueryDslPredicateExecutor
import org.springframework.data.repository.CrudRepository

interface HistoryRepository : CrudRepository<History, Int>, QueryDslPredicateExecutor<History> {
    fun findFirstByRecordOrderByIdDesc(record: Record): History?

    fun countByRecord(record: Record): Int
}