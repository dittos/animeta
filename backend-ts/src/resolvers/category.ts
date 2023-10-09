import { CategoryResolvers } from "src/graphql/generated";
import { CategoryId } from "./id";

export const Category: CategoryResolvers = {
  id: CategoryId.resolver,
  databaseId: (entity) => entity.id.toString(),
}
