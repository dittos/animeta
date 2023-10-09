import { StatusType } from "src/entities/status_type"
import { getRecord } from "src/services/record"
import { getUser } from "src/services/user"
import { PostResolvers, StatusType as GqlStatusType } from "src/graphql/generated"
import { isIdOnly } from "./utils"
import { getWork, getWorkEpisode } from "src/services/work"
import { PostId } from "./id"

export const Post: PostResolvers = {
  id: PostId.resolver,
  databaseId: (entity) => entity.id.toString(),

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
  async work(history, _, _2, info) {
    const id = history.work_id
    if (isIdOnly(info)) return { id }
    return getWork(id)
  },
  async episode(history) {
    if (!/^[0-9]+$/.test(history.status)) return null
    const work = await getWork(history.work_id)
    return getWorkEpisode(work, Number(history.status))
  },
  statusType: (history) => StatusType[history.status_type] as GqlStatusType,
  updatedAt: (history) => history.updated_at,
  containsSpoiler: (history) => history.contains_spoiler,
}
