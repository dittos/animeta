import { RecordResolvers } from "src/graphql/generated";
import { StatusType } from "src/entities/status_type";
import { isIdOnly } from "./utils";
import { getUser } from "src/services/user"
import { getWork } from "src/services/work"
import { getCategory } from "src/services/category";
import { hasNewerEpisode } from "src/services/record";
import { getRecordPosts } from "src/services/post";
import { PostId, RecordId } from "./id";

export const Record: RecordResolvers = {
  id: RecordId.resolver,
  databaseId: (entity) => entity.id.toString(),
  
  async user(record, _, _2, info) {
    const id = record.user_id
    if (isIdOnly(info)) return { id }
    return getUser(id)
  },
  async work(record, _, _2, info) {
    const id = record.work_id
    if (isIdOnly(info)) return { id }
    return getWork(id)
  },
  async category(record, _, _2, info) {
    const id = record.category_id
    if (!id) return null
    if (isIdOnly(info)) return { id }
    return getCategory(id)
  },

  statusType: (record) => StatusType[record.status_type] as keyof typeof StatusType,
  updatedAt: (record) => record.updated_at,
  hasNewerEpisode: (record, _, ctx) => record.user_id === ctx.currentUser?.id ? hasNewerEpisode(record) : null,

  posts: (record, { beforeId, count }) =>
    getRecordPosts(record, {
      beforeId: beforeId != null ? PostId.toDatabaseId(beforeId) : null,
      count,
    }),
}
