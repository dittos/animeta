package net.animeta.backend.service

import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import com.mysema.commons.lang.CloseableIterator
import com.querydsl.core.types.Expression
import com.querydsl.core.types.Projections
import com.querydsl.jpa.HQLTemplates
import com.querydsl.jpa.impl.JPAQuery
import net.animeta.backend.chart.ChartItem
import net.animeta.backend.chart.ChartRange
import net.animeta.backend.chart.diff
import net.animeta.backend.chart.ranked
import net.animeta.backend.model.History
import net.animeta.backend.model.QHistory.history
import net.animeta.backend.model.QRecord
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.serializer.WorkSerializer
import org.springframework.stereotype.Service
import java.sql.Timestamp
import java.time.ZoneId
import java.util.*
import java.util.concurrent.TimeUnit
import javax.persistence.EntityManager

@Service
class ChartService(val entityManager: EntityManager,
                   val workRepository: WorkRepository,
                   val userRepository: UserRepository,
                   val workSerializer: WorkSerializer) {
    data class ChartItemWork(val id: Int, val title: String, val image_url: String?)
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

    fun getPopularWorks(range: ChartRange?, limit: Int): List<ChartItem<ChartItemWork>> {
        return popularWorksCache.get(Optional.ofNullable(range)) { getPopularWorksUncached(range) }.take(limit)
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
        val works = workRepository.findAll(chart.map { it.`object` }).associateBy { it.id }
        return chart.map { it.map { id ->
            val work = works[id]!!
            ChartItemWork(work.id!!, work.title, workSerializer.getImageUrl(work))
        } }
    }

    private fun iteratePopularWorks(range: ChartRange?): CloseableIterator<Pair<Int, Int>> {
        if (range != null) {
            val factor = history.user.countDistinct()
            val instantRange = range.instantRange(defaultTimeZone())
            return JPAQuery<History>(entityManager, HQLTemplates.DEFAULT)
                    .select(Projections.constructor(Pair::class.java, history.work.id, factor) as Expression<Pair<Int, Int>>)
                    .from(history)
                    .where(history.updatedAt.between(Timestamp.from(instantRange.lowerEndpoint()), Timestamp.from(instantRange.upperEndpoint())))
                    .groupBy(history.work.id)
                    .orderBy(factor.desc())
                    .having(factor.gt(1))
                    .iterate()
        } else {
            val factor = QRecord.record.count()
            return JPAQuery<History>(entityManager, HQLTemplates.DEFAULT)
                    .select(Projections.constructor(Pair::class.java, QRecord.record.work.id, factor) as Expression<Pair<Int, Int>>)
                    .from(QRecord.record)
                    .groupBy(QRecord.record.work.id)
                    .orderBy(factor.desc())
                    .having(factor.gt(1))
                    .iterate()
        }
    }

    fun getActiveUsers(range: ChartRange?, limit: Int): List<ChartItem<ChartItemUser>> {
        return activeUsersCache.get(Optional.ofNullable(range)) { getActiveUsersUncached(range) }.take(limit)
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
        val users = userRepository.findAll(chart.map { it.`object` }).associateBy { it.id }
        return chart.map { it.map { id ->
            val user = users[id]!!
            ChartItemUser(user.username)
        } }
    }

    private fun iterateActiveUsers(range: ChartRange?): CloseableIterator<Pair<Int, Int>> {
        val factor = history.user.count()
        val query = JPAQuery<History>(entityManager, HQLTemplates.DEFAULT)
                .select(Projections.constructor(Pair::class.java, history.user.id, factor) as Expression<Pair<Int, Int>>)
                .from(history)
        if (range != null) {
            val instantRange = range.instantRange(defaultTimeZone())
            query.where(history.updatedAt.between(Timestamp.from(instantRange.lowerEndpoint()), Timestamp.from(instantRange.upperEndpoint())))
        }
        return query.groupBy(history.user.id)
                .orderBy(factor.desc())
                .iterate()
    }
}