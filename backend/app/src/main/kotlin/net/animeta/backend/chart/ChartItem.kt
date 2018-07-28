package net.animeta.backend.chart

import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ChartItem<T>(val rank: Int, val `object`: T, val factor: Int, val factor_percent: Double,
                        val diff: Int? = null, val sign: Int? = null) {
    fun <R> map(mapper: (T) -> R): ChartItem<R> {
        return ChartItem(rank, mapper.invoke(`object`), factor, factor_percent, diff, sign)
    }
}