import { TablePeriodResolvers } from "src/graphql/generated";
import { Periods, getTablePeriodItems, isRecommendationEnabled } from "src2/services/table";

export const TablePeriod: TablePeriodResolvers = {
  period: period => period.toString(),
  year: period => period.year,
  month: period => period.getMonth(),
  isCurrent: period => period.equals(Periods.current),
  isRecommendationEnabled: period => isRecommendationEnabled(period),
  items: async (period, { onlyAdded, username, withRecommendations }, ctx) => {
    return getTablePeriodItems(period, onlyAdded, username ?? null, withRecommendations, ctx.currentUser)
  }
}
