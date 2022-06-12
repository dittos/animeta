import { QueryResolvers } from "src/graphql/generated"
import { timeline } from "./timeline"
import { weeklyWorksChart } from "./weeklyWorksChart"

export const Query: QueryResolvers = {
  timeline,
  weeklyWorksChart,
}
