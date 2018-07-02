package net.animeta.backend.service

import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import net.animeta.backend.chart.ChartItem
import net.animeta.backend.chart.ChartRange
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
import java.util.*
import java.util.concurrent.TimeUnit
import java.util.stream.Stream
import kotlin.streams.asSequence

@Service
class ChartService(val transactionManager: PlatformTransactionManager,
                   val workRepository: WorkRepository,
                   val userRepository: UserRepository,
                   val workSerializer: WorkSerializer) {
    data class ChartItemWork(val id: Int, val title: String, val image_url: String?, val image_center_y: Double)
    data class ChartItemUser(val username: String)

    private val maxLimit = 100
    private val popularWorksCache: Cache<Optional<ChartRange>, List<ChartItem<ChartItemWork>>> =
            CacheBuilder.newBuilder()
                    .maximumSize(3) // {weekly, monthly, overall}
                    .expireAfterWrite(1, TimeUnit.HOURS)
                    .build()
    private val activeUsersCache: Cache<Optional<ChartRange>, List<ChartItem<ChartItemUser>>> =
            CacheBuilder.newBuilder()
                    .maximumSize(3) // {weekly, monthly, overall}
                    .expireAfterWrite(1, TimeUnit.HOURS)
                    .build()

    fun defaultTimeZone() = ZoneId.of("Asia/Seoul")

    fun invalidateWorkCache() {
        popularWorksCache.invalidateAll()
    }

    fun getPopularWorks(range: ChartRange?, limit: Int): List<ChartItem<ChartItemWork>> {
        return popularWorksCache.get(Optional.ofNullable(range)) {
            val template = TransactionTemplate(transactionManager)
            template.isReadOnly = true
            template.execute { getPopularWorksUncached(range) }
        }.take(limit)
    }

    fun getPopularWorksUncached(range: ChartRange?): List<ChartItem<ChartItemWork>> {
        val chart = if (range != null) {
            iteratePopularWorks(range).use { a ->
                iteratePopularWorks(range.prev()).use { b ->
                    diff(ranked(a.asSequence()).take(maxLimit), ranked(b.asSequence()))
                }
            }
        } else {
            iteratePopularWorks(range).use {
                ranked(it.asSequence()).take(maxLimit).toList()
            }
        }
        val works = workRepository.findAllById(chart.map { it.`object` }).associateBy { it.id }
        return chart.map { it.map { id ->
            val work = works[id]!!
            ChartItemWork(work.id!!, work.title, workSerializer.getImageUrl(work), work.image_center_y)
        } }
    }

    private fun iteratePopularWorks(range: ChartRange?): Stream<Pair<Int, Long>> {
        if (range != null) {
            val instantRange = range.instantRange(defaultTimeZone())
            return workRepository.iterateAllByPopularityWithinRange(
                    minUpdatedAt = Timestamp.from(instantRange.lowerEndpoint()),
                    maxUpdatedAt = Timestamp.from(instantRange.upperEndpoint())
            )
        } else {
            return workRepository.iterateAllByAllTimePopularity()
        }
    }

    fun getActiveUsers(range: ChartRange?, limit: Int): List<ChartItem<ChartItemUser>> {
        return activeUsersCache.get(Optional.ofNullable(range)) {
            val template = TransactionTemplate(transactionManager)
            template.isReadOnly = true
            template.execute { getActiveUsersUncached(range) }
        }.take(limit)
    }

    fun getActiveUsersUncached(range: ChartRange?): List<ChartItem<ChartItemUser>> {
        val chart = if (range != null) {
            iterateActiveUsers(range).use { a ->
                iterateActiveUsers(range.prev()).use { b ->
                    diff(ranked(a.asSequence()).take(maxLimit), ranked(b.asSequence()))
                }
            }
        } else {
            iterateActiveUsers(range).use {
                ranked(it.asSequence()).take(maxLimit).toList()
            }
        }
        val users = userRepository.findAllById(chart.map { it.`object` }).associateBy { it.id }
        return chart.map { it.map { id ->
            val user = users[id]!!
            ChartItemUser(user.username)
        } }
    }

    private fun iterateActiveUsers(range: ChartRange?): Stream<Pair<Int, Long>> {
        if (range != null) {
            val instantRange = range.instantRange(defaultTimeZone())
            return userRepository.iterateAllByActivenessWithinRange(
                    minUpdatedAt = Timestamp.from(instantRange.lowerEndpoint()),
                    maxUpdatedAt = Timestamp.from(instantRange.upperEndpoint())
            )
        } else {
            return userRepository.iterateAllByAllTimeActiveness()
        }
    }
}
