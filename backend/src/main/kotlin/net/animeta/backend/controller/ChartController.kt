package net.animeta.backend.controller

import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import com.mysema.commons.lang.CloseableIterator
import com.querydsl.core.types.Expression
import com.querydsl.core.types.Projections
import com.querydsl.core.types.dsl.Wildcard
import com.querydsl.jpa.HQLTemplates
import com.querydsl.jpa.impl.JPAQuery
import net.animeta.backend.chart.ChartItem
import net.animeta.backend.chart.SundayStartWeek
import net.animeta.backend.chart.diff
import net.animeta.backend.chart.ranked
import net.animeta.backend.model.History
import net.animeta.backend.model.QHistory.history
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.serializer.WorkSerializer
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.sql.Timestamp
import java.time.ZoneId
import java.util.concurrent.TimeUnit
import javax.persistence.EntityManager

private val defaultTimeZone = ZoneId.of("Asia/Seoul")

@RestController
@RequestMapping("/v2/charts")
class ChartController(val entityManager: EntityManager,
                      val workRepository: WorkRepository,
                      val workSerializer: WorkSerializer) {
    data class ChartItemWork(val id: Int, val title: String, val image_url: String?)

    private val weeklyPopularWorksCache: Cache<SundayStartWeek, List<ChartItem<ChartItemWork>>> = CacheBuilder.newBuilder()
            .maximumSize(1) // Keep only one (last) week
            .expireAfterWrite(1, TimeUnit.HOURS)
            .build()

    @GetMapping("/works/weekly")
    fun getWeeklyPopularWorks(@RequestParam limit: Int): List<ChartItem<ChartItemWork>> {
        val lastWeek = SundayStartWeek.now(defaultTimeZone).prev()
        return weeklyPopularWorksCache.get(lastWeek) {
            val chart = getPopularWorksOfWeek(lastWeek).use { a ->
                getPopularWorksOfWeek(lastWeek.prev()).use { b ->
                    diff(ranked(a.asSequence()).take(128), ranked(b.asSequence()))
                }
            }
            chart.map { it.map { id ->
                val work = workRepository.findOne(id)
                ChartItemWork(work.id, work.title, workSerializer.getImageUrl(work))
            } }
        }.take(limit)
    }

    private fun getPopularWorksOfWeek(week: SundayStartWeek): CloseableIterator<Pair<Int, Int>> {
        val range = week.instantRange(defaultTimeZone)
        return JPAQuery<History>(entityManager, HQLTemplates.DEFAULT)
                .select(Projections.constructor(Pair::class.java, history.work.id, Wildcard.count) as Expression<Pair<Int, Int>>)
                .from(history)
                .where(history.updated_at.between(Timestamp.from(range.lowerEndpoint()), Timestamp.from(range.upperEndpoint())))
                .groupBy(history.work.id)
                .orderBy(Wildcard.count.desc())
                .iterate()
    }
}