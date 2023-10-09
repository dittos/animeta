import { MutationResolvers } from "src/graphql/generated";
import { updateCategoryOrder as _updateCategoryOrder } from "src/services/category";
import { db } from "src/database";
import { requireUser } from "../utils";
import { CategoryId } from "../id";

export const updateCategoryOrder: MutationResolvers['updateCategoryOrder'] = async (_, { input }, ctx) => {
  const currentUser = requireUser(ctx)
  const categories = await db.transaction(() => {
    return _updateCategoryOrder(currentUser, input.categoryIds.map(it => CategoryId.toDatabaseId(it)))
  })
  return { categories }
}
