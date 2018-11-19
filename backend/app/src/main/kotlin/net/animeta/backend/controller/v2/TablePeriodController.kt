package net.animeta.backend.controller.v2

import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import net.animeta.backend.db.Datastore
import net.animeta.backend.db.query
import net.animeta.backend.dto.CreditType
import net.animeta.backend.dto.Recommendation
import net.animeta.backend.dto.WorkCredit
import net.animeta.backend.dto.WorkDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.Period
import net.animeta.backend.model.QWorkPeriodIndex.workPeriodIndex
import net.animeta.backend.model.User
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.repository.WorkStaffRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.RecordSerializer
import net.animeta.backend.serializer.WorkSerializer
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.util.concurrent.TimeUnit

@RestController
@RequestMapping("/v2/table/periods/{period:[0-9]{4}Q[1-4]}")
class TablePeriodController(val datastore: Datastore,
                            val recordRepository: RecordRepository,
                            val workSerializer: WorkSerializer,
                            val recordSerializer: RecordSerializer,
                            val workStaffRepository: WorkStaffRepository) {
    data class CacheKey(val period: Period, val onlyFirstPeriod: Boolean)
    private val cache: Cache<CacheKey, List<WorkDTO>> = CacheBuilder.newBuilder()
            .expireAfterWrite(1, TimeUnit.HOURS)
            .build()

    fun invalidateCache() {
        cache.invalidateAll()
    }

    @GetMapping
    fun get(@PathVariable("period") periodParam: String,
            @RequestParam("only_first_period", defaultValue = "false") onlyFirstPeriod: Boolean,
            @RequestParam("with_recommendations", defaultValue = "false") withRecommendations: Boolean,
            @CurrentUser(required = false) currentUser: User?): List<WorkDTO> {
        val period = Period.parse(periodParam) ?: throw ApiException.notFound()
        val result = cache.get(CacheKey(period, onlyFirstPeriod)) {
            var query = workPeriodIndex.query
                    .filter(workPeriodIndex.period.eq(period.toString()))
            if (onlyFirstPeriod) {
                query = query.filter(workPeriodIndex.firstPeriod.isTrue)
            }
            datastore.query(query).map { workSerializer.serialize(it.work) }
        }
        if (currentUser != null) {
            val records = recordRepository.findAllByUserAndWorkIdIn(currentUser, result.map { it.id })
                    .map { recordSerializer.serialize(it, RecordSerializer.legacyOptions()) }
                    .associateBy { it.work_id }
            val relatedStaffs = if (withRecommendations && result.isNotEmpty()) {
                workStaffRepository.batchFindRelatedByUser(result.map { it.id }, currentUser)
                    .groupBy { it.personId }
            } else {
                emptyMap()
            }
            return result.map {
                val record = records[it.id]
                if (withRecommendations) {
                    val recommendations = generateRecommendations(it, relatedStaffs)
                    it.copy(
                        record = record,
                        recommendations = recommendations,
                        recommendationScore = recommendations.sumBy {
                            if (it is Recommendation.ByCredit) it.score else 0
                        } * recommendations.size
                    )
                } else {
                    it.copy(record = record)
                }
            }
        }
        return result
    }

    private val scoreByCreditType = mapOf(
        CreditType.ORIGINAL_WORK to 10,
        CreditType.CHIEF_DIRECTOR to 20,
        CreditType.SERIES_DIRECTOR to 20,
        CreditType.DIRECTOR to 20,
        CreditType.SERIES_COMPOSITION to 10,
        CreditType.CHARACTER_DESIGN to 6,
        CreditType.MUSIC to 5
    )

    fun generateRecommendations(work: WorkDTO, relatedStaffs: Map<Int, List<WorkStaffRepository.RelatedRow>>): List<Recommendation> {
        if (work.metadata == null) {
            return emptyList()
        }
        return work.metadata.credits.mapNotNull { credit ->
            relatedStaffs[credit.personId]?.let { staffs ->
                val related = staffs.withIndex().mapNotNull { (index, it) ->
                    // TODO: group same credit type (in FE?)
                    val creditType = workSerializer.taskToCreditType[it.staffTask.toLowerCase()]
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
    }

    fun isCompatible(a: CreditType, b: CreditType): Boolean {
        if (a == b) {
            return true
        }
        return workSerializer.compatibleCreditTypes.any { it.contains(a) && it.contains(b) }
    }
}
