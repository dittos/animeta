import { MutationResolvers } from "src/graphql/generated";
import { getOrCreateWork } from "src/services/work";
import { createRecord as _createRecord } from "src/services/record";
import { db } from "src/database";
import { StatusType } from "src/entities/status_type";
import { requireUser } from "../utils";
import { updateStatus } from "src/services/twitter";
import { formatTweet } from "src/utils/tweet";
import { CategoryId } from "../id";

export const createRecord: MutationResolvers['createRecord'] = async (_, { input }, ctx) => {
  const currentUser = requireUser(ctx)
  const work = await getOrCreateWork(input.title)
  const {record, history} = await db.transaction(async () => {
    return _createRecord(currentUser, work, {
      title: input.title,
      categoryId: input.categoryId ? CategoryId.toDatabaseId(input.categoryId) : null,
      status: input.status,
      statusType: StatusType[input.statusType],
      comment: input.comment,
      rating: input.rating ?? null,
    })
  })
  
  if (input.publishTwitter) {
    await updateStatus(currentUser, formatTweet(history))
  }

  return {
    record,
    post: history,
  }
}
