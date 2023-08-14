import { MutationResolvers } from "src/graphql/generated";
import { createRecord } from "./createRecord";
import { createCategory } from "./createCategory";
import { renameCategory } from "./renameCategory";
import { deleteCategory } from "./deleteCategory";
import { updateCategoryOrder } from "./updateCategoryOrder";
import { updateRecordTitle } from "./updateRecordTitle";
import { updateRecordCategoryId } from "./updateRecordCategoryId";

export const Mutation: MutationResolvers = {
  createRecord,
  updateRecordTitle,
  updateRecordCategoryId,
  
  createCategory,
  renameCategory,
  deleteCategory,
  updateCategoryOrder,
}
