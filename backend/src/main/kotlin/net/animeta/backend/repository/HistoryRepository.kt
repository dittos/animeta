package net.animeta.backend.repository

import net.animeta.backend.model.History
import org.springframework.data.querydsl.QueryDslPredicateExecutor
import org.springframework.data.repository.CrudRepository

interface HistoryRepository : CrudRepository<History, Int>, QueryDslPredicateExecutor<History>