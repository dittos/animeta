import { QueryResolvers } from "src/graphql/generated";
import { Period } from "src/utils/period";
import { getTablePeriodItems, Periods } from "src2/services/table";
import { Temporal } from "@js-temporal/polyfill";

const defaultTimeZone = Temporal.TimeZone.from('Asia/Seoul')

export const tablePeriod: QueryResolvers['tablePeriod'] = async (_, { period: periodParam, onlyAdded, username, withRecommendations }, ctx) => {
  const period = Period.parse(periodParam)
  if (!period) throw new Error('invalid period: ' + periodParam)
  const maxPeriod = Period.now(defaultTimeZone).next()
  if (period.compareTo(Periods.min) < 0 || period.compareTo(maxPeriod) > 0) {
    throw new Error('no data')
  }
  return getTablePeriodItems(period, onlyAdded, username ?? null, withRecommendations, ctx.currentUser)
}

export const tablePeriod2: QueryResolvers['tablePeriod2'] = async (_, { period: periodParam }) => {
  const period = Period.parse(periodParam)
  if (!period) throw new Error('invalid period: ' + periodParam)
  const maxPeriod = Period.now(defaultTimeZone).next()
  if (period.compareTo(Periods.min) < 0 || period.compareTo(maxPeriod) > 0) {
    throw new Error('no data')
  }
  return period
}
