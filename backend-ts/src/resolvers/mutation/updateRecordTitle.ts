import { MutationResolvers } from "src/graphql/generated";
import { db } from "src/database";
import { permissionDeniedException, requireUser } from "../utils";
import { Record } from "src/entities/record.entity";
import { getOrCreateWork } from "src/services/work";
import { updateRecordWorkAndTitle } from "src/services/record";
import { RecordId } from "../id";

export const updateRecordTitle: MutationResolvers['updateRecordTitle'] = async (_, { input }, ctx) => {
  const currentUser = requireUser(ctx)
  const record = await db.findOneOrFail(Record, RecordId.toDatabaseId(input.recordId))
  if (currentUser.id !== record.user_id)
    throw permissionDeniedException()
  const work = await getOrCreateWork(input.title)
  await db.transaction(async () =>
    // TODO: refetch record here
    updateRecordWorkAndTitle(record, work, input.title)
  )
  return { record }
}
