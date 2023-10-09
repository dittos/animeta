import { FastifyRequest } from "fastify";
import { ApiException } from "src/exceptions";
import { getCurrentUser } from "src/auth";
import { getUnratedRecords } from "src/services/record";

type UnratedRecord = {
  id: string;
  title: string;
}

export default async function(params: {
  cursor: string | null,
}, request: FastifyRequest): Promise<{
  data: UnratedRecord[];
  nextCursor: string | null;
}> {
  const currentUser = await getCurrentUser(request)
  if (!currentUser) throw new ApiException('Not logged in', 403)

  const count = 20
  const records = await getUnratedRecords(currentUser, count + 1, Number(params.cursor))
  return {
    data: records.slice(0, count).map(record => ({
      id: record.id.toString(),
      title: record.title,
    })),
    nextCursor: records.length > count ? records[records.length - 1].id.toString() : null,
  }
}
