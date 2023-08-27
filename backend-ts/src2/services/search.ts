import { SearchResultItem, SearchService } from "src/services/search.service";
import { db } from "src2/database";

const service = new SearchService(db)

export async function searchWorks(query: string, limit: number, minRecordCount: number = 2): Promise<SearchResultItem[]> {
  return service.search(query, limit, minRecordCount)
}

export async function suggestWorks(query: string, limit: number): Promise<SearchResultItem[]> {
  return service.suggest(query, limit)
}
