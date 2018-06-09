package net.animeta.backend.service

import net.animeta.backend.dto.Episode
import net.animeta.backend.model.TitleMapping
import net.animeta.backend.model.Work
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.TitleMappingRepository
import net.animeta.backend.repository.WorkRepository
import org.springframework.stereotype.Service

@Service
class WorkService(private val workRepository: WorkRepository,
                  private val titleMappingRepository: TitleMappingRepository,
                  private val historyRepository: HistoryRepository) {
    fun getOrCreate(title: String): Work {
        val mapping = titleMappingRepository.findOneByTitle(title)
        if (mapping != null) {
            return mapping.work
        }
        val key = normalizeTitle(title)
        val similarMapping = titleMappingRepository.findFirstByKey(key)
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
                    raw_metadata = null,
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
        val result = historyRepository.findAllStatusWithCountAndCommentByWork(work)
                .mapNotNull { (status, count) ->
                    val statusNumber = status.toIntOrNull()
                    if (statusNumber != null)
                        Episode(number = statusNumber, post_count = count)
                    else
                        null
                }
                .associateBy { it.number }
                .toMutableMap()
        val result2 = historyRepository.findAllStatusWithCountAndNoCommentByWork(work)
        for ((status, count) in result2) {
            val statusNumber = status.toIntOrNull()
            if (statusNumber != null && !result.containsKey(statusNumber) && count > 1) {
                result[statusNumber] = Episode(number = statusNumber, post_count = null)
            }
        }
        return result.values.sortedBy { it.number }
    }

    companion object {
        private const val exceptionChars = "!+"

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
