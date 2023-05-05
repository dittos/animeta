import { MutationResolvers } from "src/graphql/generated";
import { createRecord } from "./createRecord";
import { createCategory } from "./createCategory";
import { renameCategory } from "./renameCategory";
import { deleteCategory } from "./deleteCategory";
import { updateCategoryOrder } from "./updateCategoryOrder";

export const Mutation: MutationResolvers = {
  createRecord,
  
  createCategory,
  renameCategory,
  deleteCategory,
  updateCategoryOrder,
}
