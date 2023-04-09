import { StatusType } from "src/entities/status_type";
import { UserResolvers } from "src/graphql/generated";
import { getUserPosts } from "src2/services/post";
import { countRecordsForFilter, getUserRecords } from "src2/services/record";

export const User: UserResolvers = {
  name: (user) => user.username,

  posts: (user, { beforeId, count }) =>
    getUserPosts(user, {
      beforeId: beforeId != null ? Number(beforeId) : null,
      count,
    }),
  
  records: (user, { statusType, categoryId, orderBy, first }) =>
    getUserRecords(user, {
      statusType: statusType ? StatusType[statusType] : null,
      categoryId: categoryId != null ? Number(categoryId) : null,
      orderBy: orderBy ?? null,
      limit: first ?? null,
    }),
  
  async recordCountForFilter(user, { statusType, categoryId }) {
    const counts = await countRecordsForFilter(user, {
      statusType: statusType ? StatusType[statusType] : null,
      categoryId: categoryId != null ? Number(categoryId) : null,
    })
    return {
      total: counts.total,
      filtered: counts.filtered,
      byStatusType: Object.entries(counts.by_status_type).map(([key, count]) => ({key, count})),
      byCategoryId: Object.entries(counts.by_category_id).map(([key, count]) => ({key, count})),
    }
  }
}
