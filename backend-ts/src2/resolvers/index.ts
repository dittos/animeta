import { Resolvers } from 'src/graphql/generated'
import { Query } from './query'
import { Mutation } from './mutation'
import { User } from './user'
import { Work } from './work'
import { Episode } from './episode'
import { Record } from './record'
import { Post } from "./post"
import { Credit, Recommendation, WorkCredit } from './recommendation'
import { TablePeriod } from './tablePeriod'
import { CuratedList } from './curatedList'
import { Category } from './category'

export const resolvers: Resolvers = {
  Query,
  Mutation,
  User,
  Work,
  Episode,
  Record,
  Post,
  Category,
  Recommendation,
  Credit,
  WorkCredit,
  TablePeriod,
  CuratedList,
}
