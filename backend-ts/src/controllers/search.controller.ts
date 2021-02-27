import { Controller, Get, Query } from "@nestjs/common";
import { SearchService } from "src/services/search.service";
import { SearchResultItem } from 'shared/types';

@Controller('/api/v4/search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  async search(@Query('q') q: string): Promise<SearchResultItem[]> {
    return await this.searchService.search(q, 30)
  }

  @Get('suggest')
  async suggest(@Query('q') q: string): Promise<SearchResultItem[]> {
    return await this.searchService.suggest(q, 30)
  }
}
