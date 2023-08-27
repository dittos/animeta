import { QueryResolvers } from "src/graphql/generated";
import { searchWorks as _searchWorks } from "src2/services/search";
import { getWork } from "src2/services/work";

export const searchWorks: QueryResolvers['searchWorks'] = async (_, { query }) => {
  const result = await _searchWorks(query, 30)
  const edges = await Promise.all(
    result.map(async it => ({
      node: await getWork(it.id),
      recordCount: it.recordCount,
    })
  ))
  return { edges }
}
