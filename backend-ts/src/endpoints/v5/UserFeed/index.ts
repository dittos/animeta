import { ApiException } from "src/exceptions";
import { serializeUser } from "src/serializers/user";
import { UserDto } from "src/schemas/user";
import { getUserByName } from "src/services/user";
import { StatusType } from "src/schemas/statusType";
import { getUserPosts } from "src/services/post";
import { StatusType as StatusTypeEnum } from "src/entities/status_type";
import { History } from "src/entities/history.entity";
import { getRecord } from "src/services/record";

export default async function (params: {
  username: string;
}): Promise<{
  user: UserDto,
  entries: {
    id: string,
    title: string,
    statusType: StatusType,
    status: string,
    comment: string,
    updatedAt: number, // TODO: Date
  }[]
}> {
  const user = await getUserByName(params.username)
  if (!user) throw ApiException.notFound()
  const posts = await getUserPosts(user, { count: 32 })
  return {
    user: await serializeUser(user, null, {}),
    entries: await Promise.all(posts.nodes.map(serializeEntry)),
  }
}

async function serializeEntry(it: History) {
  return {
    id: it.id.toString(),
    title: (await getRecord(it.record_id)).title,
    statusType: StatusTypeEnum[it.status_type] as StatusType,
    status: it.status,
    comment: it.comment,
    updatedAt: it.updated_at?.getTime() ?? 0,
  }
}
