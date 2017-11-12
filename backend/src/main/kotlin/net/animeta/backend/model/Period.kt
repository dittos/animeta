package net.animeta.backend.model

import java.time.YearMonth
import java.time.ZoneId

data class Period(val year: Int, val period: Int) {
    init {
        if (!(period in 1..4)) {
            throw IllegalArgumentException("Period should be 1..4")
        }
    }

    override fun toString(): String {
        return "${year}Q${period}"
    }

    companion object {
        private val pattern = "([0-9]{4})Q([1-4])".toRegex()

        fun parse(s: String): Period? {
            return pattern.matchEntire(s)?.destructured?.let { (year, quarter) ->
                Period(year.toInt(), quarter.toInt())
            }
        }

        fun now(zoneId: ZoneId): Period {
            val ym = YearMonth.now(zoneId)
            return Period(ym.year, ym.monthValue / 4 + 1)
        }
    }
}