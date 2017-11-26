package net.animeta.backend.chart

import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.WeekFields

data class SundayStartWeekRange(val sunday: LocalDate) : ChartRange {
    companion object {
        fun now(zoneId: ZoneId): SundayStartWeekRange {
            return including(LocalDate.now(zoneId))
        }

        fun including(date: LocalDate): SundayStartWeekRange {
            val field = WeekFields.SUNDAY_START.dayOfWeek()
            return SundayStartWeekRange(date.with(field, field.range().minimum))
        }
    }

    override fun prev(): SundayStartWeekRange {
        return SundayStartWeekRange(sunday.minusWeeks(1))
    }

    override fun startDate(): LocalDate {
        return sunday
    }

    override fun endDate(): LocalDate {
        return sunday.plusWeeks(1).minusDays(1)
    }
}