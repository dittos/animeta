package net.animeta.backend.service

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory
import net.animeta.backend.dto.Episode
import net.animeta.backend.exception.ApiException
import net.animeta.backend.metadata.readStringList
import net.animeta.backend.model.Company
import net.animeta.backend.model.Period
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
        val metadata: JsonNode
        try {
            metadata = ObjectMapper(YAMLFactory()).readTree(rawMetadata)
        } catch (e: Exception) {
            throw ApiException("YAML parse failed: ${e.message}", HttpStatus.BAD_REQUEST)
        }
        work.raw_metadata = rawMetadata
        work.metadata = objectMapper.writeValueAsString(metadata)
        val periods = metadata["periods"]?.let { readStringList(it) }?.map { Period.parse(it) }?.filterNotNull() ?: listOf()
        work.periodIndexes.clear()
        work.periodIndexes.addAll(periods.sorted().mapIndexed { index, period ->
            WorkPeriodIndex(work = work, period = period.toString(), firstPeriod = index == 0)
        })
        val studios = metadata["studio"]?.let { readStringList(it) }?.map {
            companyRepository.findOneByName(it) ?: companyRepository.save(Company(
                name = it,
                metadata = null,
                annId = null
            ))
        }
        if (studios != null) {
            work.companies.clear()
            work.companies.addAll(studios.withIndex().map { (index, company) ->
                WorkCompany(work = work, position = index, company = company)
            })
        }
        workRepository.save(work)
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
