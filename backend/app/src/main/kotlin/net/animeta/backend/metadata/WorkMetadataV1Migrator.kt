package net.animeta.backend.metadata

import com.fasterxml.jackson.databind.JsonNode
import net.animeta.backend.model.Period
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.temporal.Temporal

object WorkMetadataV1Migrator {
    private val defaultTimeZone = ZoneId.of("Asia/Seoul")

    fun migrate(item: JsonNode): WorkMetadata {
        var titleNode: JsonNode? = item["title"]
        if (titleNode != null && titleNode.isObject()) {
            titleNode = titleNode["ko"]
        }
        val title = titleNode?.asText()

        val periods = item["periods"]?.let { readStringList(it) }
            ?.map { Period.parse(it)!! }
        val period = periods?.firstOrNull()
            ?: Period.now(defaultTimeZone)
        val schedules = mutableMapOf<String, WorkMetadata.Schedule>()
        item["schedule"]?.let { schedules["jp"] = getSchedule(it, period) }
        item["schedule_kr"]?.let { schedules["kr"] = getSchedule(it, period) }

        val source = item["source"]?.asText()?.let {
            when (it) {
                "manga" -> WorkMetadata.SourceType.MANGA
                "original" -> WorkMetadata.SourceType.ORIGINAL
                "lightnovel" -> WorkMetadata.SourceType.LIGHT_NOVEL
                "game" -> WorkMetadata.SourceType.GAME
                "4koma" -> WorkMetadata.SourceType.FOUR_KOMA
                "visualnovel" -> WorkMetadata.SourceType.VISUAL_NOVEL
                "novel" -> WorkMetadata.SourceType.NOVEL
                else -> null // warn?
            }
        }

        return WorkMetadata(
            title = title,
            periods = periods,
            studios = item["studio"]?.let { readStringList(it) },
            source = source,
            website = item["website"]?.asText(),
            namuRef = item["namu_ref"]?.asText(),
            annId = item["ann_id"]?.asText(),
            schedules = schedules,
            durationMinutes = item["duration"]?.asText()?.let { it.trimEnd('m').toIntOrNull() }
        )
    }

    private fun getSchedule(node: JsonNode, period: Period): WorkMetadata.Schedule {
        val date: Temporal?
        val broadcasts: List<String>?
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
            is LocalDate -> WorkMetadata.Schedule(
                date = date.atStartOfDay(),
                datePrecision = WorkMetadata.Schedule.DatePrecision.DATE,
                broadcasts = broadcasts
            )
            is LocalDateTime -> WorkMetadata.Schedule(
                date = date,
                datePrecision = WorkMetadata.Schedule.DatePrecision.DATE_TIME,
                broadcasts = broadcasts
            )
            else -> WorkMetadata.Schedule(
                date = null,
                datePrecision = null,
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