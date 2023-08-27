import { SearchResultItem } from "shared/types";
import { suggestWorks } from "src2/services/search";

export default async function (params: {query: string}): Promise<SearchResultItem[]> {
  return await suggestWorks(params.query, 30)
}
