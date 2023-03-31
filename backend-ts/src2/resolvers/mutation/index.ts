import { MutationResolvers } from "src/graphql/generated";
import { createRecord } from "./createRecord";

export const Mutation: MutationResolvers = {
  createRecord,
}
