import { Resolvers } from 'src/graphql/generated'
import { Query } from "./query"
import { Post } from "./post"
import { User } from './user'
import { Work } from './work'

export const resolvers: Resolvers = {
  Query,
  Post,
  User,
  Work,
}
