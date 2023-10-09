import { MutationResolvers } from "src/graphql/generated";
import { renameCategory as _renameCategory } from "src/services/category";
import { db } from "src/database";
import { permissionDeniedException, requireUser } from "../utils";
import { Category } from "src/entities/category.entity";
import { CategoryId } from "../id";

export const renameCategory: MutationResolvers['renameCategory'] = async (_, { input }, ctx) => {
  const currentUser = requireUser(ctx)
  const category = await db.findOneOrFail(Category, CategoryId.toDatabaseId(input.categoryId))
  if (currentUser.id !== category.user_id)
    throw permissionDeniedException()
  await _renameCategory(category, input.name)
  return { category }
}
