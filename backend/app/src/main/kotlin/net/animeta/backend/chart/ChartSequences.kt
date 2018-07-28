package net.animeta.backend.chart

import kotlin.coroutines.experimental.buildSequence

fun <T> ranked(seq: Sequence<Pair<T, Long>>): Sequence<ChartItem<T>> = buildSequence {
    var rank = 0L
    var prev = -1L
    var ptr = 1L
    var max: Long? = null

    for ((obj, factor) in seq) {
        if (prev != factor)
            rank = ptr
        prev = factor
        ptr++
        max = max ?: factor
        yield(ChartItem(
                rank = rank.toInt(),
                `object` = obj,
                factor = factor.toInt(),
                factor_percent = factor.toDouble() / max * 100.0
        ))
    }
}

fun <T> diff(chart: Sequence<ChartItem<T>>, pastChart: Sequence<ChartItem<T>>): List<ChartItem<T>> {
    val assoc = chart.associateBy { it.`object` }.toMutableMap()
    for (pastItem in pastChart) {
        assoc.computeIfPresent(pastItem.`object`) { _, item ->
            val diff = Math.abs(pastItem.rank - item.rank)
            item.copy(diff = Math.abs(diff), sign = when {
                diff < 0 -> -1
                diff > 0 -> 1
                else -> 0
            })
        }
    }
    return assoc.values.toList().sortedBy { it.rank }
}
