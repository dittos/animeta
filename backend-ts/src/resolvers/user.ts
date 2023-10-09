import { Category } from "src/entities/category.entity";
import { History } from "src/entities/history.entity";
import { Record } from "src/entities/record.entity";
import { StatusType } from "src/entities/status_type";
import { RecordFilter, UserResolvers } from "src/graphql/generated";
import { db } from "src/database";
import { getUserPosts } from "src/services/post";
import { getUserRecords } from "src/services/record";
import { CountByCriteria, countRecordsForFilter } from "src/services/userRecords";
import { CategoryId, PostId, UserId } from "./id";

export const User: UserResolvers = {
  id: UserId.resolver,
  databaseId: (entity) => entity.id.toString(),
  
  name: (user) => user.username,
  joinedAt: (user) => user.date_joined,
  isCurrentUser: (user, _, { currentUser }) => user.id === currentUser?.id,

  recordCount: (user) => db.count(Record, { where: { user } }),
  postCount: (user) => db.count(History, { where: { user } }),

  posts: (user, { beforeId, count }) =>
    getUserPosts(user, {
      beforeId: beforeId != null ? PostId.toDatabaseId(beforeId) : null,
      count,
    }),
  
  records: (user, { statusType, categoryId, orderBy, first }) =>
    getUserRecords(user, {
      statusType: statusType ? StatusType[statusType] : null,
      categoryId: categoryId != null ? CategoryId.toDatabaseId(categoryId) : null,
      orderBy: orderBy ?? null,
      limit: first ?? null,
    }),
  
  async recordFilters(user, { statusType, categoryId }) {
    const counts = await countRecordsForFilter(user, {
      statusType: statusType ? StatusType[statusType] : null,
      categoryId: categoryId != null ? CategoryId.toDatabaseId(categoryId) : null,
    })
    return {
      totalCount: counts.total,
      filteredCount: counts.filtered,
      statusType: toFilter(counts.by_status_type),
      categoryId: toFilter(counts.by_category_id),
    }
  },

  async categories(user) {
    return await db.find(Category, { where: { user }, order: {position: 'ASC'} })
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
