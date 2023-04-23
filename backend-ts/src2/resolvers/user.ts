import { StatusType } from "src/entities/status_type";
import { RecordFilter, UserResolvers } from "src/graphql/generated";
import { CountByCriteria } from "src/services/user_records.service";
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
  
  async recordFilters(user, { statusType, categoryId }) {
    const counts = await countRecordsForFilter(user, {
      statusType: statusType ? StatusType[statusType] : null,
      categoryId: categoryId != null ? Number(categoryId) : null,
    })
    return {
      statusType: toFilter(counts.by_status_type),
      categoryId: toFilter(counts.by_category_id),
    }
  }
}

function toFilter(countByCriteria: CountByCriteria): RecordFilter {
  return {
    allCount: countByCriteria._all,
    items: Object.entries(countByCriteria)
      .filter(([key, _]) => key !== '_all')
      .map(([key, count]) => ({
        key: key.toUpperCase(), // FIXME: only for StatusType
        count,
      })),
  }
}
