import { QueryResolvers } from "src/graphql/generated";
import { Period } from "src/utils/period";
import { Periods } from "src/services/table";
import { Temporal } from "@js-temporal/polyfill";

const defaultTimeZone = Temporal.TimeZone.from('Asia/Seoul')

export const tablePeriod: QueryResolvers['tablePeriod'] = async (_, { period: periodParam }) => {
  const period = Period.parse(periodParam)
  if (!period) throw new Error('invalid period: ' + periodParam)
  const maxPeriod = Period.now(defaultTimeZone).next()
  if (period.compareTo(Periods.min) < 0 || period.compareTo(maxPeriod) > 0) {
    throw new Error('no data')
  }
  return period
}
