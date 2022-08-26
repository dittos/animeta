import { QueryResolvers } from "src/graphql/generated";
import { SearchService } from "src/services/search.service";
import { db } from "src2/database";
import { getWork } from "src2/services/work";

export const searchWorks: QueryResolvers['searchWorks'] = async (_, { query }) => {
  const result = await new SearchService(db).search(query, 30)
  const edges = await Promise.all(
    result.map(async it => ({
      node: await getWork(it.id),
      recordCount: it.recordCount,
    })
  ))
  return { edges }
}
