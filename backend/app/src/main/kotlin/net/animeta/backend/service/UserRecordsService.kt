package net.animeta.backend.service

import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.repository.RecordRepository.CountGroupRow
import org.springframework.stereotype.Service
import java.util.Optional

@Service
class UserRecordsService(private val recordRepository: RecordRepository) {
    data class RecordCounts(val total: Int, val filtered: Int, val by_status_type: Map<String, Int>, val by_category_id: Map<String, Int>)

    fun count(user: User, statusType: StatusType?, categoryId: Optional<Int>?): RecordCounts {
        val counts = recordRepository.countGroupsByUser(user)
        val filtered = filterCounts(counts, statusType, categoryId)
        val countByStatusType = mutableMapOf("_all" to 0)
        for (row in filterCounts(counts, null, categoryId)) {
            countByStatusType.compute("_all") { _, value -> (value ?: 0) + row.count.toInt() }
            countByStatusType.compute(row.statusType.name.toLowerCase()) { _, value -> (value ?: 0) + row.count.toInt() }
        }
        val countByCategory = mutableMapOf("_all" to 0)
        for (row in filterCounts(counts, statusType, null)) {
            countByCategory.compute("_all") { _, value -> (value ?: 0) + row.count.toInt() }
            countByCategory.compute(row.categoryId?.toString() ?: "0") { _, value -> (value ?: 0) + row.count.toInt() }
        }
        return RecordCounts(
                total = counts.sumBy { it.count.toInt() },
                filtered = filtered.sumBy { it.count.toInt() },
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
