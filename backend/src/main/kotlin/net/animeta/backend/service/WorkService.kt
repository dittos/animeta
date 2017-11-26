package net.animeta.backend.service

import com.querydsl.core.types.Expression
import com.querydsl.core.types.Projections
import com.querydsl.core.types.dsl.Wildcard
import com.querydsl.jpa.HQLTemplates
import com.querydsl.jpa.impl.JPAQuery
import net.animeta.backend.dto.Episode
import net.animeta.backend.model.History
import net.animeta.backend.model.QHistory.history
import net.animeta.backend.model.TitleMapping
import net.animeta.backend.model.Work
import net.animeta.backend.repository.TitleMappingRepository
import net.animeta.backend.repository.WorkRepository
import org.springframework.stereotype.Service
import javax.persistence.EntityManager

@Service
class WorkService(val workRepository: WorkRepository,
                  val titleMappingRepository: TitleMappingRepository,
                  val entityManager: EntityManager) {
    fun getOrCreate(title: String): Work {
        val mapping = titleMappingRepository.findOneByTitle(title)
        if (mapping != null) {
            return mapping.work
        }
        val key = normalizeTitle(title)
        val similarMapping = titleMappingRepository.findOneByKey(key)
        if (similarMapping != null) {
            val mapping = titleMappingRepository.save(TitleMapping(
                    work = similarMapping.work,
                    title = title,
                    key = key
            ))
            return mapping.work
        } else {
            val work = workRepository.save(Work(
                    title = title,
                    image_filename = null,
                    metadata = null,
                    blacklisted = false
            ))
            titleMappingRepository.save(TitleMapping(
                    work = work,
                    title = title,
                    key = key
            ))
            return work
        }
    }

    fun getEpisodes(work: Work): List<Episode> {
        val query = JPAQuery<History>(entityManager, HQLTemplates.DEFAULT)
                .select(Projections.constructor(Pair::class.java, history.status, Wildcard.count) as Expression<Pair<String, Int>>)
                .from(history)
                .where(history.work.eq(work))
                .where(history.comment.ne(""))
                .groupBy(history.status)
        val result = query.fetch()
                .mapNotNull { (status, count) ->
                    val statusNumber = status.toIntOrNull()
                    if (statusNumber != null)
                        Episode(number = statusNumber, post_count = count)
                    else
                        null
                }
                .associateBy { it.number }
                .toMutableMap()
        val query2 = JPAQuery<History>(entityManager, HQLTemplates.DEFAULT)
                .select(Projections.constructor(Pair::class.java, history.status, Wildcard.count) as Expression<Pair<String, Int>>)
                .from(history)
                .where(history.work.eq(work))
                .where(history.comment.eq(""))
                .groupBy(history.status)
        for ((status, count) in query2.fetch()) {
            val statusNumber = status.toIntOrNull()
            if (statusNumber != null && !result.containsKey(statusNumber) && count > 1) {
                result[statusNumber] = Episode(number = statusNumber, post_count = null)
            }
        }
        return result.values.sortedBy { it.number }
    }

    companion object {
        private val exceptionChars = "!+"

        fun normalizeTitle(title: String): String {
            return title
                    .map {
                        // full width -> half width
                        if (it in '\uFF01'..'\uFF5E') {
                            it.minus(0xFF01).plus(0x21)
                        } else {
                            it
                        }
                    }
                    .filter { exceptionChars.contains(it) || "LN".contains(it.category.code[0]) }
                    .joinToString("")
                    .toLowerCase()
                    .trim()
        }
    }
}