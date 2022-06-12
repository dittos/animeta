import { WorkResolvers } from "src/graphql/generated"
import { getWorkImageUrl } from "src/services/work.service"

export const Work: WorkResolvers = {
  imageUrl: (work) => getWorkImageUrl(work),
}
