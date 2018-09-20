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
                    .selectRelated(workPeriodIndex.work.indexes)
            if (onlyFirstPeriod) {
                query = query.filter(workPeriodIndex.firstPeriod.isTrue)
            }
            datastore.query(query).map { workSerializer.serialize(it.work) }
        }
        if (currentUser != null) {
            val records = recordRepository.findAllByUserAndWorkIdIn(currentUser, result.map { it.id })
                    .map { recordSerializer.serialize(it, RecordSerializer.legacyOptions()) }
                    .associateBy { it.work_id }
            return result.map { it.copy(
                record = records[it.id],
                recommendations = if (withRecommendations) generateRecommendations(it, currentUser) else null
            ) }
        }
        return result
    }

    fun generateRecommendations(work: WorkDTO, user: User): List<Recommendation>? {
        if (work.metadata == null) {
            return null
        }
        return work.metadata.credits.map { credit ->
            val staffs = workStaffRepository.findByPersonIdAndWorkInUserRecords(credit.personId, user.id!!)
            Recommendation.ByCredit(
                credit = credit,
                related = staffs.filter { it.work.id != work.id }.withIndex().mapNotNull { (index, it) ->
                    // TODO: group same credit type (in FE?)
                    val creditType = workSerializer.taskToCreditType[it.task.toLowerCase()]
                    if (creditType != null && isCompatible(creditType, credit.type)) {
                        Pair(Pair(creditType.ordinal, index), WorkCredit(it.work.id!!, it.work.title, creditType))
                    } else {
                        null
                    }
                }.sortedWith(compareBy({ it.first.first }, { it.first.second })).map { it.second }.take(2)
            )
        }.filter { it.related.isNotEmpty() }
    }

    fun isCompatible(a: CreditType, b: CreditType): Boolean {
        if (a == b) {
            return true
        }
        return workSerializer.compatibleCreditTypes.any { it.contains(a) && it.contains(b) }
    }
}
