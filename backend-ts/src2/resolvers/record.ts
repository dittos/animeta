import { RecordResolvers } from "src/graphql/generated";
import { StatusType } from "src/entities/status_type";
import { isIdOnly } from "./utils";
import { getUser } from "src2/services/user"
import { getWork } from "src2/services/work"
import { getCategory } from "src2/services/category";
import { hasNewerEpisode } from "src2/services/record";

export const Record: RecordResolvers = {
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
}
