package net.animeta.backend.chart

import kotlin.coroutines.experimental.buildSequence

fun <T> ranked(seq: Sequence<Pair<T, Int>>): Sequence<ChartItem<T>> = buildSequence {
    var rank = 0
    var prev = -1
    var ptr = 1
    var max: Int? = null

    for ((obj, factor) in seq) {
        if (prev != factor)
            rank = ptr
        prev = factor
        ptr++
        max = max ?: factor
        yield(ChartItem(
                rank = rank,
                `object` = obj,
                factor = factor,
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