import { StatusType } from "src/entities/status_type"
import { getRecord } from "src2/services/record"
import { getUser } from "src2/services/user"
import { PostResolvers, StatusType as GqlStatusType } from "src/graphql/generated"
import { isIdOnly } from "./utils"

export const Post: PostResolvers = {
  async user(history, _, _2, info) {
    const id = history.user_id
    if (isIdOnly(info)) return { id }
    return getUser(id)
  },
  async record(history, _, _2, info) {
    const id = history.record_id
    if (isIdOnly(info)) return { id }
    return getRecord(id)
  },
  statusType: (history) => StatusType[history.status_type] as GqlStatusType,
  updatedAt: (history) => history.updated_at,
  containsSpoiler: (history) => history.contains_spoiler,
}
