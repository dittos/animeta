import { MutationResolvers } from "src/graphql/generated";
import { createCategory as _createCategory } from "src/services/category.service";
import { db } from "src2/database";
import { requireUser } from "../utils";

export const createCategory: MutationResolvers['createCategory'] = async (_, { input }, ctx) => {
  const currentUser = requireUser(ctx)
  const category = await _createCategory(db, currentUser, input)
  return { category }
}
