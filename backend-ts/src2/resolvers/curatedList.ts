import { CuratedListResolvers } from "src/graphql/generated"
import { getCuratedListWorks } from "src2/services/curatedList"

export const CuratedList: CuratedListResolvers = {
  async works(metadata, _, ctx) {
    const {notAddedWorks, totalCount} = await getCuratedListWorks(metadata, ctx.currentUser)
    return {
      edges: notAddedWorks.map(it => ({node: it})),
      totalCount,
    }
  },
}
