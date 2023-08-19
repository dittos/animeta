import { ApiException } from "src/controllers/exceptions";
import { serializeUser } from 'src2/serializers/user';
import { UserDto } from 'src2/schemas/user';
import { getUserByName } from "src2/services/user";
import { StatusType } from "shared/types";
import { getUserPosts } from "src2/services/post";
import { StatusType as StatusTypeEnum } from "src/entities/status_type";
import { History } from "src/entities/history.entity";
import { getRecord } from "src2/services/record";

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
