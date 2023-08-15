import { CategoryResolvers } from "src/graphql/generated";

export const Category: CategoryResolvers = {
  databaseId: (entity) => entity.id.toString(),
}
