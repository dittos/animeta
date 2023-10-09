import { QueryResolvers } from "src/graphql/generated"
import { getAllCuratedLists, getCuratedList } from "src/services/curatedList"
import { getPost } from "src/services/post"
import { getRecord } from "src/services/record"
import { getValidPeriods, Periods } from "src/services/table"
import { getUser, getUserByName } from "src/services/user"
import { getWork, getWorkByTitle } from "src/services/work"
import { searchWorks } from "./searchWorks"
import { tablePeriod } from "./tablePeriod"
import { timeline } from "./timeline"
import { weeklyWorksChart } from "./weeklyWorksChart"
import { PostId, RecordId, UserId, WorkId } from "../id"

export const Query: QueryResolvers = {
  currentUser: (_, _2, { currentUser }) => currentUser,
  user: (_, { id }) => getUser(UserId.toDatabaseId(id)),
  userByName: (_, { name }) => getUserByName(name),
  timeline,
  curatedLists: getAllCuratedLists,
  curatedList: (_, { id }) => getCuratedList(id.__id),
  searchWorks,
  weeklyWorksChart,
  work: (_, { id }) => getWork(WorkId.toDatabaseId(id)),
  workByTitle: (_, { title }) => getWorkByTitle(title),
  post: (_, { id }) => getPost(PostId.toDatabaseId(id)),
  record: (_, { id }) => getRecord(RecordId.toDatabaseId(id)),
  tablePeriod,
  currentTablePeriod: () => Periods.current,
  tablePeriods: () => getValidPeriods(),
}
