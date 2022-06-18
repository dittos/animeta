import { Resolvers } from 'src/graphql/generated'
import { Query } from "./query"
import { User } from './user'
import { Work } from './work'
import { Episode } from './episode'
import { Record } from './record'
import { Post } from "./post"

export const resolvers: Resolvers = {
  Query,
  User,
  Work,
  Episode,
  Record,
  Post,
}
