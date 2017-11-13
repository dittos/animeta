package net.animeta.backend.serializer

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.google.common.net.UrlEscapers
import net.animeta.backend.dto.WorkDTO
import net.animeta.backend.dto.WorkLinks
import net.animeta.backend.dto.WorkMetadata
import net.animeta.backend.dto.WorkSchedule
import net.animeta.backend.model.Period
import net.animeta.backend.model.User
import net.animeta.backend.model.Work
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.service.WorkService
import org.springframework.stereotype.Service
import java.io.IOException
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.temporal.Temporal

@Service
class WorkSerializer(val workService: WorkService,
                     val recordRepository: RecordRepository,
                     val recordSerializer: RecordSerializer,
                     val objectMapper: ObjectMapper) {
    private val defaultTimeZone = ZoneId.of("Asia/Seoul")

    fun serialize(work: Work, viewer: User? = null, full: Boolean = false): WorkDTO {
        val index = work.indexes.firstOrNull()
        return WorkDTO(
                id = work.id!!,
                title = work.title,
                image_url = getImageUrl(work),
                alt_titles = if (full) {
                    work.titleMappings.map { it.title }.filterNot { it == work.title }
                } else {
                    null
                },
                episodes = if (full) workService.getEpisodes(work) else null,
                record_count = index?.record_count ?: recordRepository.countByWork(work),
                rank = index?.rank,
                record = if (viewer != null) {
                    recordRepository.findOneByWorkAndUser(work, viewer)
                            ?.let { recordSerializer.serialize(it) }
                } else {
                    null
                },
                metadata = if (work.metadata != null) {
                    try {
                        serializeMetadata(work, objectMapper.readTree(work.metadata))
                    } catch (e: IOException) {
                        null
                    }
                } else {
                    null
                }
        )
    }

    fun getImageUrl(work: Work): String? {
        if (work.image_filename != null)
            return "https://animeta.net/media/" + work.image_filename
        return null
    }

    fun serializeMetadata(work: Work, item: JsonNode): WorkMetadata {
        var titleNode: JsonNode? = item["title"]
        if (titleNode != null && titleNode.isObject()) {
            titleNode = titleNode["ko"]
        }
        val title = titleNode?.asText() ?: work.title

        val links = WorkLinks(
                website = item["website"]?.asText(),
                namu = item["namu_ref"]?.asText()?.let { namuLink(it) },
                ann_id = item["ann_id"]?.asText()?.let { "http://www.animenewsnetwork.com/encyclopedia/anime.php?id=${it}" }
        )

        val period = item["periods"]?.let { readStringList(it) }
                ?.map { Period.parse(it) }?.firstOrNull()
                ?: Period.now(defaultTimeZone)

        return WorkMetadata(
                title = title,
                links = links,
                studios = item["studio"]?.let { readStringList(it) },
                source = item["source"]?.asText(),
                schedule = mapOf(
                        "jp" to item["schedule"]?.let { getSchedule(it, period) },
                        "kr" to item["schedule_kr"]?.let { getSchedule(it, period) }
                )
        )
    }

    fun namuLink(ref: String): String {
        val page = ref.substringBeforeLast('#')
        val anchor = ref.substringAfterLast('#', "")
        val url = "https://namu.wiki/w/${UrlEscapers.urlPathSegmentEscaper().escape(page)}"
        if (anchor.isNotEmpty()) {
            return "${url}#${UrlEscapers.urlFragmentEscaper().escape(anchor)}"
        } else {
            return url
        }
    }

    fun readStringList(node: JsonNode): List<String> {
        if (node.isTextual) {
            return listOf(node.asText())
        } else {
            return node.map { it.asText() }
        }
    }

    fun getSchedule(node: JsonNode, period: Period): WorkSchedule? {
        var date: Temporal?
        var broadcasts: List<String>?
        if (node.isTextual) {
            date = parseDateTime(node.asText(), period)
            broadcasts = null
        } else if (node.size() == 1) {
            date = null
            broadcasts = readStringList(node[0])
        } else {
            date = parseDateTime(node[0].asText(), period)
            broadcasts = readStringList(node[1])
        }
        return when (date) {
            is LocalDate -> WorkSchedule(
                    date = date.atStartOfDay(defaultTimeZone).toInstant().toEpochMilli(),
                    date_only = true,
                    broadcasts = broadcasts
            )
            is LocalDateTime -> WorkSchedule(
                    date = date.atZone(defaultTimeZone).toInstant().toEpochMilli(),
                    date_only = false,
                    broadcasts = broadcasts
            )
            else -> WorkSchedule(
                    date = null,
                    date_only = null,
                    broadcasts = broadcasts
            )
        }
    }

    private fun parseDateTime(s: String, period: Period): Temporal {
        val parts = s.split(" ")
        if (parts.size == 1) {
            return parseDate(s, period)
        }
        val date = parseDate(parts[0], period)
        val timeParts = parts[1].split(":")
        return date.atTime(timeParts[0].toInt(), timeParts[1].toInt())
    }

    private fun parseDate(s: String, period: Period): LocalDate {
        val parts = s.split("-")
        return if (parts.size == 3) {
            LocalDate.of(parts[0].toInt(), parts[1].toInt(), parts[2].toInt())
        } else {
            LocalDate.of(period.year, parts[0].toInt(), parts[1].toInt())
        }
    }
}