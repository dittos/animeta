package net.animeta.backend.metadata

import com.fasterxml.jackson.annotation.JsonFormat
import net.animeta.backend.model.Period
import java.time.LocalDateTime

data class WorkMetadata(
    val version: Int,
    val title: String?,
    val periods: List<Period>?,
    val studios: List<String>?,
    val source: SourceType?,
    val website: String?,
    val namuRef: String?,
    val annId: String?,
    val durationMinutes: Int?,
    val schedules: Map<String, Schedule>?
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