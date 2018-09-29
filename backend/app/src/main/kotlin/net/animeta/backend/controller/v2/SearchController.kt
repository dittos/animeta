package net.animeta.backend.controller.v2

import net.animeta.backend.service.SearchService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/search")
class SearchController(private val searchService: SearchService) {
    data class SearchResultItem(val title: String, val n: Int, val id: Int)

    @GetMapping
    fun search(@RequestParam("q") query: String,
               @RequestParam("min_record_count", defaultValue = "2") minRecordCount: Int): List<SearchResultItem> {
        return searchService.searchWorks(query, limit = 30, minRecordCount = minRecordCount)
                .map { SearchResultItem(it.title, it.record_count, it.workId) }
    }

    @GetMapping("/suggest")
    fun suggest(@RequestParam("q") query: String): List<SearchResultItem> {
        return searchService.suggestWorks(query, limit = 30)
                .map { SearchResultItem(it.title, it.record_count, it.workId) }
    }
}