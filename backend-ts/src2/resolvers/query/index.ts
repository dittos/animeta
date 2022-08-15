import { QueryResolvers } from "src/graphql/generated"
import { getPost } from "src2/services/post"
import { getValidPeriods, Periods } from "src2/services/table"
import { getUser, getUserByName } from "src2/services/user"
import { getWork, getWorkByTitle } from "src2/services/work"
import { tablePeriod } from "./tablePeriod"
import { timeline } from "./timeline"
import { weeklyWorksChart } from "./weeklyWorksChart"

export const Query: QueryResolvers = {
  user: (_, { id }) => getUser(Number(id)),
  userByName: (_, { name }) => getUserByName(name),
  timeline,
  weeklyWorksChart,
  work: (_, { id }) => getWork(Number(id)),
  workByTitle: (_, { title }) => getWorkByTitle(title),
  post: (_, { id }) => getPost(Number(id)),
  tablePeriod,
  tablePeriod2: tablePeriod, // deprecated
  currentTablePeriod: () => Periods.current,
  tablePeriods: () => getValidPeriods(),
}
