package net.animeta.backend.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import net.animeta.backend.dto.Episode
import net.animeta.backend.exception.ApiException
import net.animeta.backend.metadata.WorkMetadata
import net.animeta.backend.model.Work
import net.animeta.backend.repository.HistoryRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service

@Service
class WorkService(
    private val historyRepository: HistoryRepository,
    private val objectMapper: ObjectMapper
) {
    fun getEpisodes(work: Work): List<Episode> {
        val result = historyRepository.findAllStatusWithCountAndCommentByWorkId(work.id!!)
                .mapNotNull { (status, count) ->
                    val statusNumber = status.toIntOrNull()
                    if (statusNumber != null)
                        Episode(number = statusNumber, post_count = count)
                    else
                        null
                }
                .associateBy { it.number }
                .toMutableMap()
        val result2 = historyRepository.findAllStatusWithCountAndNoCommentByWorkId(work.id!!)
        for ((status, count) in result2) {
            val statusNumber = status.toIntOrNull()
            if (statusNumber != null && !result.containsKey(statusNumber) && count > 1) {
                result[statusNumber] = Episode(number = statusNumber, post_count = null)
            }
        }
        return result.values.sortedBy { it.number }
    }

    fun parseMetadata(rawMetadata: String): WorkMetadata {
        val metadata: WorkMetadata
        try {
            metadata = objectMapper.readValue(if (rawMetadata.isEmpty()) "{}" else rawMetadata)
            if (metadata.version < 2) {
                throw Exception("${metadata.version} is outdated metadata version")
            }
        } catch (e: Exception) {
            throw ApiException("Metadata parse failed: ${e.message}", HttpStatus.BAD_REQUEST)
        }
        return metadata
    }

    companion object {
        private const val exceptionChars = "!+"

        fun titleKey(title: String): String {
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
