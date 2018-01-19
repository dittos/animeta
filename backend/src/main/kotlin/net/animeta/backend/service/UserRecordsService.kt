package net.animeta.backend.service

import com.querydsl.core.types.Projections
import com.querydsl.core.types.dsl.Wildcard
import com.querydsl.jpa.HQLTemplates
import com.querydsl.jpa.impl.JPAQuery
import net.animeta.backend.model.QRecord.record
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import org.springframework.stereotype.Service
import java.util.*
import javax.persistence.EntityManager

@Service
class UserRecordsService(private val entityManager: EntityManager) {
    data class RecordCounts(val total: Int, val filtered: Int, val by_status_type: Map<String, Int>, val by_category_id: Map<String, Int>)

    data class CountGroupRow(val statusType: StatusType, val categoryId: Int?, val count: Int)

    fun count(user: User, statusType: StatusType?, categoryId: Optional<Int>?): RecordCounts {
        val counts = JPAQuery<CountGroupRow>(entityManager, HQLTemplates.DEFAULT)
                .select(Projections.constructor(CountGroupRow::class.java, record.status_type, record.category.id, Wildcard.countAsInt))
                .from(record)
                .where(record.user.eq(user))
                .groupBy(record.status_type, record.category.id)
                .fetch()
        val filtered = filterCounts(counts, statusType, categoryId)
        val countByStatusType = mutableMapOf("_all" to 0)
        for (row in filterCounts(counts, null, categoryId)) {
            countByStatusType.compute("_all") { _, value -> (value ?: 0) + row.count }
            countByStatusType.compute(row.statusType.name.toLowerCase()) { _, value -> (value ?: 0) + row.count }
        }
        val countByCategory = mutableMapOf("_all" to 0)
        for (row in filterCounts(counts, statusType, null)) {
            countByCategory.compute("_all") { _, value -> (value ?: 0) + row.count }
            countByCategory.compute(row.categoryId?.toString() ?: "0") { _, value -> (value ?: 0) + row.count }
        }
        return RecordCounts(
                total = counts.sumBy { it.count },
                filtered = filtered.sumBy { it.count },
                by_status_type = countByStatusType,
                by_category_id = countByCategory
        )
    }

    private fun filterCounts(counts: List<CountGroupRow>, statusType: StatusType?, categoryId: Optional<Int>?): List<CountGroupRow> {
        var result = counts
        if (statusType != null) {
            result = result.filter { it.statusType == statusType }
        }
        if (categoryId != null) {
            result = result.filter { it.categoryId == categoryId.orElse(null) }
        }
        return result
    }
}