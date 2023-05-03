import { QueryResolvers } from "src/graphql/generated"
import { getAllCuratedLists, getCuratedList } from "src2/services/curatedList"
import { getPost } from "src2/services/post"
import { getValidPeriods, Periods } from "src2/services/table"
import { getUser, getUserByName } from "src2/services/user"
import { getWork, getWorkByTitle } from "src2/services/work"
import { searchWorks } from "./searchWorks"
import { tablePeriod } from "./tablePeriod"
import { timeline } from "./timeline"
import { weeklyWorksChart } from "./weeklyWorksChart"

export const Query: QueryResolvers = {
  currentUser: (_, _2, { currentUser }) => currentUser,
  user: (_, { id }) => getUser(Number(id)),
  userByName: (_, { name }) => getUserByName(name),
  timeline,
  curatedLists: getAllCuratedLists,
  curatedList: (_, { id }) => getCuratedList(id),
  searchWorks,
  weeklyWorksChart,
  work: (_, { id }) => getWork(Number(id)),
  workByTitle: (_, { title }) => getWorkByTitle(title),
  post: (_, { id }) => getPost(Number(id)),
  tablePeriod,
  currentTablePeriod: () => Periods.current,
  tablePeriods: () => getValidPeriods(),
}
