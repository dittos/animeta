import { SearchResultItem } from "src/schemas/search";
import { searchWorks } from "src/services/search";

export default async function (params: {query: string}): Promise<SearchResultItem[]> {
  return await searchWorks(params.query, 30)
}
