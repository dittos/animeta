import { SearchResultItem } from "src/schemas/search";
import { suggestWorks } from "src/services/search";

export default async function (params: {query: string}): Promise<SearchResultItem[]> {
  return await suggestWorks(params.query, 30)
}
