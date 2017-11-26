package net.animeta.backend.chart

import java.time.LocalDate
import java.time.YearMonth
import java.time.ZoneId

data class MonthRange(val yearMonth: YearMonth) : ChartRange {
    companion object {
        fun now(zoneId: ZoneId): MonthRange {
            return including(LocalDate.now(zoneId))
        }

        fun including(date: LocalDate): MonthRange {
            return MonthRange(YearMonth.from(date))
        }
    }

    override fun prev(): MonthRange {
        return MonthRange(yearMonth.minusMonths(1))
    }

    override fun startDate(): LocalDate {
        return yearMonth.atDay(1)
    }

    override fun endDate(): LocalDate {
        return yearMonth.atEndOfMonth()
    }
}