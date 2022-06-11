import { UserResolvers } from "src/graphql/generated";

export const User: UserResolvers = {
  name: (user) => user.username,
}
