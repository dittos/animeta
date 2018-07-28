package net.animeta.backend.chart

import java.time.DayOfWeek
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.TemporalAdjusters

data class SundayStartWeekRange(val sunday: LocalDate) : ChartRange {
    companion object {
        fun now(zoneId: ZoneId): SundayStartWeekRange {
            return including(LocalDate.now(zoneId))
        }

        fun including(date: LocalDate): SundayStartWeekRange {
            return SundayStartWeekRange(date.with(TemporalAdjusters.previousOrSame(DayOfWeek.SUNDAY)))
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