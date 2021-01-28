package net.animeta.backend.controller.v2

import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import net.animeta.backend.db.Datastore
import net.animeta.backend.db.query
import net.animeta.backend.dto.WorkDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.Period
import net.animeta.backend.model.QWorkPeriodIndex.workPeriodIndex
import net.animeta.backend.model.User
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.RecordSerializer
import net.animeta.backend.serializer.WorkSerializer
import net.animeta.backend.service.RecommendationService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.ZoneId
import java.util.concurrent.TimeUnit

@RestController
@RequestMapping("/v2/table/periods/{period:[0-9]{4}Q[1-4]}")
class TablePeriodController(val datastore: Datastore,
                            val userRepository: UserRepository,
                            val recordRepository: RecordRepository,
                            val workSerializer: WorkSerializer,
                            val recordSerializer: RecordSerializer,
                            val recommendationService: RecommendationService) {
    private val cache: Cache<Period, List<WorkDTO>> = CacheBuilder.newBuilder()
            .expireAfterWrite(1, TimeUnit.HOURS)
            .build()
    private val defaultTimeZone = ZoneId.of("Asia/Seoul")
    private val minPeriod = Period(2014, 2)

    fun invalidateCache() {
        cache.invalidateAll()
        recommendationService.invalidateCache()
    }

    @GetMapping
    fun get(@PathVariable("period") periodParam: String,
            @RequestParam("with_recommendations", defaultValue = "false") withRecommendations: Boolean,
            @RequestParam("only_added", defaultValue = "false") onlyAdded: Boolean,
            @RequestParam("username", required = false) username: String?,
            @CurrentUser(required = false) currentUser: User?): List<WorkDTO> {
        val period = Period.parse(periodParam) ?: throw ApiException.notFound()
        val maxPeriod = Period.now(defaultTimeZone).next()
        if (period < minPeriod || period > maxPeriod) {
            throw ApiException.notFound()
        }
        var result = cache.get(period) {
            var query = workPeriodIndex.query
                    .filter(workPeriodIndex.period.eq(period.toString()))
            query = query.filter(workPeriodIndex.firstPeriod.isTrue)
            datastore.query(query).map { workSerializer.serialize(it.work) }
        }
        val user = username?.let { userRepository.findByUsername(it) } ?: currentUser
        if (user == null) {
            return result
        }
        val records = recordRepository.findAllByUserAndWorkIdIn(user, result.map { it.id })
                .map { recordSerializer.serialize(it, RecordSerializer.legacyOptions()) }
                .associateBy { it.work_id }
        val recommendationContext = if (withRecommendations && currentUser != null) {
            recommendationService.createContext(result.map { it.id }, currentUser)
        } else {
            null
        }
        if (onlyAdded) {
            result = result.filter { it.id in records }
        }
        return result.map {
            val record = records[it.id]
            if (recommendationContext != null) {
                val (recommendations, recommendationScore) = recommendationService.generate(it.id, recommendationContext)
                it.copy(
                    record = record,
                    recommendations = recommendations,
                    recommendationScore = recommendationScore
                )
            } else {
                it.copy(record = record)
            }
        }
    }
}
