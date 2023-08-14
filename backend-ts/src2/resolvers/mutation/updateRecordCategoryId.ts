import { MutationResolvers } from "src/graphql/generated";
import { db } from "src2/database";
import { permissionDeniedException, requireUser } from "../utils";
import { Record } from "src/entities/record.entity";
import { updateRecordCategory } from "src/services/record.service";
import { Category } from "src/entities/category.entity";

export const updateRecordCategoryId: MutationResolvers['updateRecordCategoryId'] = async (_, { input }, ctx) => {
  const currentUser = requireUser(ctx)
  const record = await db.findOneOrFail(Record, input.recordId)
  if (currentUser.id !== record.user_id)
    throw permissionDeniedException()

  let category: Category | null
  if (input.categoryId != null) {
    category = await db.findOne(Category, input.categoryId) ?? null
    if (category?.user_id !== record.user_id)
      throw permissionDeniedException()
  } else {
    category = null
  }
  await updateRecordCategory(record, category)
  return { record }
}
