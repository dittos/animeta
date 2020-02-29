package net.animeta.backend.service

import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import net.animeta.backend.dto.Credit
import net.animeta.backend.dto.CreditType
import net.animeta.backend.dto.Recommendation
import net.animeta.backend.dto.WorkCredit
import net.animeta.backend.model.User
import net.animeta.backend.repository.WorkStaffRepository
import org.springframework.stereotype.Service
import java.util.concurrent.TimeUnit

@Service
class RecommendationService(
    private val workStaffRepository: WorkStaffRepository
) {
    private val scoreByCreditType = mapOf(
        CreditType.ORIGINAL_WORK to 10,
        CreditType.CHIEF_DIRECTOR to 20,
        CreditType.SERIES_DIRECTOR to 20,
        CreditType.DIRECTOR to 20,
        CreditType.SERIES_COMPOSITION to 10,
        CreditType.CHARACTER_DESIGN to 6,
        CreditType.MUSIC to 5
    )
    private val compatibleCreditTypes = listOf(
        listOf(CreditType.CHIEF_DIRECTOR, CreditType.SERIES_DIRECTOR, CreditType.DIRECTOR),
        listOf(CreditType.SERIES_COMPOSITION, CreditType.ORIGINAL_WORK)
    )
    private val creditCache: Cache<Int, List<Credit>> = CacheBuilder.newBuilder()
        .expireAfterWrite(1, TimeUnit.HOURS)
        .build()

    data class Context(val relatedStaffs: Map<Int, List<WorkStaffRepository.RelatedRow>>)

    fun invalidateCache() {
        creditCache.invalidateAll()
    }

    fun createContext(workIds: List<Int>, user: User): Context {
        if (workIds.isEmpty()) {
            return Context(relatedStaffs = emptyMap())
        }
        val relatedStaffs = workStaffRepository.batchFindRelatedByUser(workIds, user)
            .groupBy { it.personId }
        return Context(relatedStaffs = relatedStaffs)
    }

    fun generate(workId: Int, context: Context): Pair<List<Recommendation>, Int> {
        val workCredits = creditCache.get(workId) {
            workStaffRepository.findByWorkId(workId).mapNotNull { staff ->
                CreditType.fromTask(staff.task)?.let { type ->
                    Credit(
                        type = type,
                        name = staff.person.name,
                        personId = staff.person.id!!
                    )
                }
            }.sortedBy { it.type.ordinal }
        }
        val result = workCredits.mapNotNull { credit ->
            context.relatedStaffs[credit.personId]?.let { staffs ->
                val related = staffs.withIndex().mapNotNull { (index, it) ->
                    // TODO: group same credit type (in FE?)
                    val creditType = CreditType.fromTask(it.staffTask.toLowerCase())
                    if (creditType != null && isCompatible(creditType, credit.type)) {
                        Pair(Pair(creditType.ordinal, index),
                            WorkCredit(it.workId, it.workTitle, creditType))
                    } else {
                        null
                    }
                }.sortedWith(compareBy({ it.first.first }, { it.first.second })).map { it.second }
                Recommendation.ByCredit(
                    credit = credit,
                    related = related.take(2),
                    score = (scoreByCreditType[credit.type] ?: 1) * related.size
                )
            }
        }.filter { it.related.isNotEmpty() }
        val score = result.sumBy {
            if (it is Recommendation.ByCredit) it.score else 0
        } * result.size
        return Pair(result, score)
    }

    private fun isCompatible(a: CreditType, b: CreditType): Boolean {
        if (a == b) {
            return true
        }
        return compatibleCreditTypes.any { it.contains(a) && it.contains(b) }
    }
}