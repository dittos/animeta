import { ChartItem } from "shared/types";

export function ranked<T>(seq: Array<[T, number]>): Array<ChartItem<T>> {
  let rank = 0
  let prev = -1
  let ptr = 1
  let max: number | null = null

  const result = []
  for (let [obj, factor] of seq) {
    if (prev !== factor)
      rank = ptr
    prev = factor
    ptr++
    max = max ?? factor
    result.push({
      rank,
      object: obj,
      factor,
      factor_percent: factor / max * 100.0
    })
  }
  return result
}

export function diff<T>(chart: Array<ChartItem<T>>, pastChart: Array<ChartItem<T>>): Array<ChartItem<T>> {
  const assoc = new Map<T, ChartItem<T>>()
  for (let item of chart) {
    assoc.set(item.object, item)
  }

  for (let pastItem of pastChart) {
    const item = assoc.get(pastItem.object)
    if (!item) continue
    const diff = pastItem.rank - item.rank
    assoc.set(item.object, {
      ...item,
      diff: Math.abs(diff),
      sign: diff < 0 ? -1 :
        diff > 0 ? 1 :
        0,
    })
  }

  return Array.from(assoc.values()).sort((a, b) => a.rank - b.rank)
}