package net.animeta.backend.service

import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import net.animeta.backend.chart.ChartItem
import net.animeta.backend.chart.ChartRange
import net.animeta.backend.chart.SundayStartWeekRange
import net.animeta.backend.chart.diff
import net.animeta.backend.chart.ranked
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.serializer.WorkSerializer
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.support.TransactionTemplate
import java.sql.Timestamp
import java.time.ZoneId
import java.util.Optional
import java.util.concurrent.TimeUnit
import java.util.stream.Stream
import kotlin.streams.asSequence

@Service
class ChartService(
    private val transactionManager: PlatformTransactionManager,
    private val workRepository: WorkRepository,
    private val workSerializer: WorkSerializer
) {
    data class ChartItemWork(val id: Int, val title: String, val image_url: String?, val image_center_y: Double)

    private val maxLimit = 100
    private val popularWorksCache: Cache<ChartRange, List<ChartItem<ChartItemWork>>> =
            CacheBuilder.newBuilder()
                    .expireAfterWrite(1, TimeUnit.HOURS)
                    .build()
    private val defaultTimeZone = ZoneId.of("Asia/Seoul")

    fun invalidateWorkCache() {
        popularWorksCache.invalidateAll()
    }

    fun getWeeklyWorks(limit: Int): List<ChartItem<ChartItemWork>> {
        val range = SundayStartWeekRange.now(defaultTimeZone).prev()
        return popularWorksCache.get(range) {
            val template = TransactionTemplate(transactionManager)
            template.isReadOnly = true
            template.execute { getPopularWorksUncached(range) }
        }.take(limit)
    }

    private fun getPopularWorksUncached(range: ChartRange): List<ChartItem<ChartItemWork>> {
        val chart = iteratePopularWorks(range).use { a ->
            iteratePopularWorks(range.prev()).use { b ->
                diff(ranked(a.asSequence()).take(maxLimit), ranked(b.asSequence()))
            }
        }
        val works = workRepository.findAllById(chart.map { it.`object` }).associateBy { it.id }
        return chart.map { it.map { id ->
            val work = works[id]!!
            ChartItemWork(work.id!!, work.title, workSerializer.getImageUrl(work), work.image_center_y)
        } }
    }

    private fun iteratePopularWorks(range: ChartRange): Stream<Pair<Int, Long>> {
        val instantRange = range.instantRange(defaultTimeZone)
        return workRepository.iterateAllByPopularityWithinRange(
            minUpdatedAt = instantRange.lowerEndpoint(),
            maxUpdatedAt = instantRange.upperEndpoint()
        )
    }
}
