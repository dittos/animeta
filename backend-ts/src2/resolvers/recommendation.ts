import { RecommendationResolvers } from "src/graphql/generated";

export const Recommendation: RecommendationResolvers = {
  resolveType() {
    return 'RecommendationByCredit'
  }
}
