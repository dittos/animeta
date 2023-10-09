import { MutationResolvers } from "src/graphql/generated";
import { deleteCategory as _deleteCategory } from "src/services/category";
import { db } from "src/database";
import { permissionDeniedException, requireUser } from "../utils";
import { Category } from "src/entities/category.entity";
import { CategoryId } from "../id";

export const deleteCategory: MutationResolvers['deleteCategory'] = async (_, { input }, ctx) => {
  const currentUser = requireUser(ctx)
  const category = await db.findOne(Category, CategoryId.toDatabaseId(input.categoryId))
  if (!category)
    return { deleted: false }
  if (currentUser.id !== category.user_id)
    throw permissionDeniedException()
  await _deleteCategory(category)
  return { deleted: true, user: currentUser }
}
