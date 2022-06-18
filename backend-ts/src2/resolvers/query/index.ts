import { QueryResolvers } from "src/graphql/generated"
import { getWork, getWorkByTitle } from "src2/services/work"
import { timeline } from "./timeline"
import { weeklyWorksChart } from "./weeklyWorksChart"

export const Query: QueryResolvers = {
  timeline,
  weeklyWorksChart,
  work: (_, { id }) => getWork(Number(id)),
  workByTitle: (_, { title }) => getWorkByTitle(title),
}
