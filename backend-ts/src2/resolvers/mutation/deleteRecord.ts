import { MutationResolvers } from "src/graphql/generated";
import { deleteRecord as _deleteRecord } from "src/services/record.service";
import { db } from "src2/database";
import { permissionDeniedException, requireUser } from "../utils";
import { Record } from "src/entities/record.entity";
import { RecordId } from "../id";

export const deleteRecord: MutationResolvers['deleteRecord'] = async (_, { input }, ctx) => {
  const currentUser = requireUser(ctx)
  const record = await db.findOne(Record, RecordId.toDatabaseId(input.recordId))
  if (!record)
    return { deleted: false }
  if (currentUser.id !== record.user_id)
    throw permissionDeniedException()
  await db.transaction(async em =>
    _deleteRecord(em, record)
  )
  return { deleted: true, user: currentUser }
}
