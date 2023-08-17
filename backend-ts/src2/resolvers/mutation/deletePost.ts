import { MutationResolvers } from "src/graphql/generated";
import { deleteRecordHistory } from "src/services/record.service";
import { db } from "src2/database";
import { permissionDeniedException, requireUser } from "../utils";
import { History } from "src/entities/history.entity";
import { PostId } from "../id";

export const deletePost: MutationResolvers['deletePost'] = async (_, { input }, ctx) => {
  const currentUser = requireUser(ctx)
  return await db.transaction(async em => {
    const history = await db.findOne(History, PostId.toDatabaseId(input.postId), {relations: ['record']})
    if (!history)
      return { deleted: false }
    if (currentUser.id !== history.user_id)
      throw permissionDeniedException()
    await deleteRecordHistory(em, history)
    return { deleted: true, record: history.record }
  })
}
