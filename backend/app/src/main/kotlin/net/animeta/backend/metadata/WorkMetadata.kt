package net.animeta.backend.metadata

import com.fasterxml.jackson.annotation.JsonFormat
import net.animeta.backend.model.Period
import java.time.LocalDateTime

data class WorkMetadata(
    val version: Int = 2,
    val title: String? = null,
    val periods: List<Period>? = null,
    val studios: List<String>? = null,
    val source: SourceType? = null,
    val website: String? = null,
    val namuRef: String? = null,
    val annId: String? = null,
    val durationMinutes: Int? = null,
    val schedules: Map<String, Schedule>? = null
) {
    enum class SourceType {
        MANGA,
        ORIGINAL,
        LIGHT_NOVEL,
        GAME,
        FOUR_KOMA,
        VISUAL_NOVEL,
        NOVEL,
    }

    data class Schedule(
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        val date: LocalDateTime?,
        val datePrecision: DatePrecision?,
        val broadcasts: List<String>?
    ) {
        enum class DatePrecision {
            YEAR_MONTH,
            DATE,
            DATE_TIME,
        }
    }
}