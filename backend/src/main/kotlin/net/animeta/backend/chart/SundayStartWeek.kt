package net.animeta.backend.chart

import com.google.common.collect.Range
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.WeekFields

data class SundayStartWeek(val sunday: LocalDate) {
    companion object {
        fun now(zoneId: ZoneId): SundayStartWeek {
            return including(LocalDate.now(zoneId))
        }

        fun including(date: LocalDate): SundayStartWeek {
            val field = WeekFields.SUNDAY_START.dayOfWeek()
            return SundayStartWeek(date.with(field, field.range().minimum))
        }
    }

    fun prev(): SundayStartWeek {
        return SundayStartWeek(sunday.minusWeeks(1))
    }

    fun instantRange(zoneId: ZoneId): Range<Instant> {
        return Range.closedOpen(
                sunday.atStartOfDay(zoneId).toInstant(),
                sunday.plusWeeks(1).atStartOfDay(zoneId).toInstant()
        )
    }
}