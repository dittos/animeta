import { MutationResolvers } from "src/graphql/generated";
import { db } from "src2/database";
import { permissionDeniedException, requireUser } from "../utils";
import { Record } from "src/entities/record.entity";
import { updateRecordRating as _updateRecordRating } from "src/services/record.service";

export const updateRecordRating: MutationResolvers['updateRecordRating'] = async (_, { input }, ctx) => {
  const currentUser = requireUser(ctx)
  const record = await db.findOneOrFail(Record, input.recordId)
  if (currentUser.id !== record.user_id)
    throw permissionDeniedException()

  await _updateRecordRating(record, input.rating ?? null)
  return { record }
}
