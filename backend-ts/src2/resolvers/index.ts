import { Resolvers } from 'src/graphql/generated'
import { Query } from "./query"
import { Post } from "./post"
import { User } from './user'

export const resolvers: Resolvers = {
  Query,
  Post,
  User,
}
