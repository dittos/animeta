package net.animeta.backend.controller

import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import com.querydsl.jpa.JPQLTemplates
import com.querydsl.jpa.impl.JPAQuery
import net.animeta.backend.dto.WorkDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.Period
import net.animeta.backend.model.QWorkPeriodIndex.workPeriodIndex
import net.animeta.backend.model.User
import net.animeta.backend.model.Work
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.RecordSerializer
import net.animeta.backend.serializer.WorkSerializer
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.web.bind.annotation.*
import java.util.concurrent.TimeUnit
import javax.persistence.EntityManager

@RestController
@RequestMapping("/v2/table/periods/{period:[0-9]{4}Q[1-4]}")
class TablePeriodController(val entityManager: EntityManager,
                            val recordRepository: RecordRepository,
                            val workSerializer: WorkSerializer,
                            val recordSerializer: RecordSerializer) {
    data class CacheKey(val period: Period, val onlyFirstPeriod: Boolean)
    private val cache: Cache<CacheKey, List<WorkDTO>> = CacheBuilder.newBuilder()
            .expireAfterWrite(1, TimeUnit.HOURS)
            .build()

    @GetMapping
    fun get(@PathVariable("period") periodParam: String,
            @RequestParam("only_first_period", defaultValue = "false") onlyFirstPeriod: Boolean,
            @CurrentUser(required = false) currentUser: User?): List<WorkDTO> {
        val period = Period.parse(periodParam) ?: throw ApiException.notFound()
        val result = cache.get(CacheKey(period, onlyFirstPeriod)) {
            val query = JPAQuery<Work>(entityManager, JPQLTemplates.DEFAULT)
                    .select(workPeriodIndex).from(workPeriodIndex)
                    .where(workPeriodIndex.period.eq(period.toString()))
                    .setHint(EntityGraph.EntityGraphType.LOAD.key, entityManager.getEntityGraph("workPeriodIndex.work.withIndex"))
            if (onlyFirstPeriod) {
                query.where(workPeriodIndex.firstPeriod.isTrue)
            }
            query.fetch().map { workSerializer.serialize(it.work) }
        }
        if (currentUser != null) {
            val records = recordRepository.findAllByUserAndWorkIdIn(currentUser, result.map { it.id })
                    .map { recordSerializer.serialize(it) }
                    .associateBy { it.work_id }
            return result.map { it.copy(record = records[it.id]) }
        }
        return result
    }
}