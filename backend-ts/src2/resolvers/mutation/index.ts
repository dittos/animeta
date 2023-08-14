import { MutationResolvers } from "src/graphql/generated";
import { createRecord } from "./createRecord";
import { createCategory } from "./createCategory";
import { renameCategory } from "./renameCategory";
import { deleteCategory } from "./deleteCategory";
import { updateCategoryOrder } from "./updateCategoryOrder";
import { updateRecordTitle } from "./updateRecordTitle";
import { updateRecordCategoryId } from "./updateRecordCategoryId";
import { updateRecordRating } from "./updateRecordRating";
import { deleteRecord } from "./deleteRecord";

export const Mutation: MutationResolvers = {
  createRecord,
  updateRecordTitle,
  updateRecordCategoryId,
  updateRecordRating,
  deleteRecord,
  
  createCategory,
  renameCategory,
  deleteCategory,
  updateCategoryOrder,
}
