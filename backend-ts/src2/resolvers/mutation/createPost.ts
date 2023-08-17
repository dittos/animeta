import { MutationResolvers } from "src/graphql/generated";
import { addRecordHistory } from "src/services/record.service";
import { db } from "src2/database";
import { StatusType } from "src/entities/status_type";
import { permissionDeniedException, requireUser } from "../utils";
import { updateStatus } from "src2/services/twitter";
import { formatTweet } from "src/utils/tweet";
import { Record } from "src/entities/record.entity";
import { RecordId } from "../id";

export const createPost: MutationResolvers['createPost'] = async (_, { input }, ctx) => {
  const currentUser = requireUser(ctx)
  const history = await db.transaction(async em => {
    const record = await db.findOneOrFail(Record, RecordId.toDatabaseId(input.recordId))
    if (currentUser.id !== record.user_id)
      throw permissionDeniedException()

    return await addRecordHistory(em, record, {
      status: input.status,
      statusType: StatusType[input.statusType],
      comment: input.comment,
      containsSpoiler: input.containsSpoiler ?? false,
      rating: input.rating ?? null,
    })
  })
  
  if (input.publishTwitter) {
    await updateStatus(currentUser, formatTweet(history))
  }

  return {
    post: history,
  }
}
