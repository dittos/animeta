package net.animeta.backend.chart

import com.google.common.collect.Range
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

interface ChartRange {
    fun prev(): ChartRange
    fun startDate(): LocalDate
    fun endDate(): LocalDate
    fun instantRange(zoneId: ZoneId): Range<Instant> {
        return Range.closedOpen(
                startDate().atStartOfDay(zoneId).toInstant(),
                endDate().plusDays(1).atStartOfDay(zoneId).toInstant()
        )
    }
}