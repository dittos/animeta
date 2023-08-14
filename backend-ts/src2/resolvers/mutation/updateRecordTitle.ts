import { MutationResolvers } from "src/graphql/generated";
import { db } from "src2/database";
import { permissionDeniedException, requireUser } from "../utils";
import { Record } from "src/entities/record.entity";
import { getOrCreateWork } from "src/services/work.service";
import { updateRecordWorkAndTitle } from "src/services/record.service";

export const updateRecordTitle: MutationResolvers['updateRecordTitle'] = async (_, { input }, ctx) => {
  const currentUser = requireUser(ctx)
  const record = await db.findOneOrFail(Record, input.recordId)
  if (currentUser.id !== record.user_id)
    throw permissionDeniedException()
  const work = await getOrCreateWork(db, input.title)
  await db.transaction(async em =>
    // TODO: refetch record here
    updateRecordWorkAndTitle(em, record, work, input.title)
  )
  return { record }
}
