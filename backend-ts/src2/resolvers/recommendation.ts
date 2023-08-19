import { CreditResolvers, RecommendationResolvers, WorkCreditResolvers } from "src/graphql/generated";
import { NodeId, WorkId } from "./id";

export const Recommendation: RecommendationResolvers = {
  resolveType() {
    return 'RecommendationByCredit'
  }
}

export const Credit: CreditResolvers = {
  // TODO: remove field
  personId: (credit) => new NodeId(credit.personId.toString())
}

export const WorkCredit: WorkCreditResolvers = {
  // TODO: remove field
  workId: (workCredit) => WorkId.fromDatabaseId(workCredit.workId)
}
