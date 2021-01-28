package net.animeta.backend.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import net.animeta.backend.dto.Episode
import net.animeta.backend.exception.ApiException
import net.animeta.backend.metadata.WorkMetadata
import net.animeta.backend.model.Company
import net.animeta.backend.model.TitleMapping
import net.animeta.backend.model.Work
import net.animeta.backend.model.WorkCompany
import net.animeta.backend.model.WorkPeriodIndex
import net.animeta.backend.repository.CompanyRepository
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.TitleMappingRepository
import net.animeta.backend.repository.WorkRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service

@Service
class WorkService(private val workRepository: WorkRepository,
                  private val titleMappingRepository: TitleMappingRepository,
                  private val historyRepository: HistoryRepository,
                  private val companyRepository: CompanyRepository,
                  private val objectMapper: ObjectMapper) {
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

    fun editMetadata(work: Work, rawMetadata: String) {
        val metadata: WorkMetadata
        try {
            metadata = objectMapper.readValue(if (rawMetadata.isEmpty()) "{}" else rawMetadata)
            if (metadata.version < 2) {
                throw Exception("${metadata.version} is outdated metadata version")
            }
        } catch (e: Exception) {
            throw ApiException("Metadata parse failed: ${e.message}", HttpStatus.BAD_REQUEST)
        }
        editMetadata(work, metadata)
    }

    fun editMetadata(work: Work, metadata: WorkMetadata) {
        work.metadata = objectMapper.writeValueAsString(metadata)
        work.raw_metadata = work.metadata
        val periods = metadata.periods ?: emptyList()
        work.periodIndexes.clear()
        work.periodIndexes.addAll(periods.sorted().mapIndexed { index, period ->
            WorkPeriodIndex(work = work, period = period.toString(), firstPeriod = index == 0)
        })
        work.first_period = periods.minOrNull()?.toString()
        val studios = metadata.studios?.map {
            companyRepository.findOneByName(it) ?: companyRepository.save(Company(
                name = it,
                metadata = null,
                annId = null
            ))
        }
        work.companies.clear()
        if (studios != null) {
            work.companies.addAll(studios.withIndex().map { (index, company) ->
                WorkCompany(work = work, position = index, company = company)
            })
        }
        workRepository.saveAndFlush(work)
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
