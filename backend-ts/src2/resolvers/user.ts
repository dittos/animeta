import { UserResolvers } from "src/graphql/generated";
import { getUserPosts } from "src2/services/post";

export const User: UserResolvers = {
  name: (user) => user.username,

  posts: (user, { beforeId, count }) =>
    getUserPosts(user, {
      beforeId: beforeId != null ? Number(beforeId) : null,
      count,
    })
}
