import { MutationResolvers } from "src/graphql/generated";
import { updateCategoryOrder as _updateCategoryOrder } from "src/services/category.service";
import { db } from "src2/database";
import { requireUser } from "../utils";

export const updateCategoryOrder: MutationResolvers['updateCategoryOrder'] = async (_, { input }, ctx) => {
  const currentUser = requireUser(ctx)
  const categories = await db.transaction(() => {
    return _updateCategoryOrder(currentUser, input.categoryIds.map(it => Number(it)))
  })
  return { categories }
}
