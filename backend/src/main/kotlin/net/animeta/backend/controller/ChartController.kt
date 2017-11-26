package net.animeta.backend.controller

import com.google.common.net.UrlEscapers
import net.animeta.backend.chart.ChartItem
import net.animeta.backend.chart.ChartRange
import net.animeta.backend.chart.MonthRange
import net.animeta.backend.chart.SundayStartWeekRange
import net.animeta.backend.service.ChartService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/v2/charts")
class ChartController(val chartService: ChartService) {
    data class GetResponse(val title: String, val start: LocalDate?, val end: LocalDate?, val has_diff: Boolean, val items: List<ChartItem<ChartItemObject>>)
    data class ChartItemObject(val link: String, val text: String)

    private fun weekly() = SundayStartWeekRange.now(chartService.defaultTimeZone()).prev()
    private fun monthly() = MonthRange.now(chartService.defaultTimeZone()).prev()
    private fun overall() = null

    @GetMapping("/works/weekly")
    fun getWeeklyWorks(@RequestParam limit: Int) = chartService.getPopularWorks(weekly(), limit)

    @GetMapping("/popular-works/weekly")
    fun getWeeklyPopularWorks(@RequestParam limit: Int) = getPopularWorks(weekly(), limit)

    @GetMapping("/popular-works/monthly")
    fun getMonthlyPopularWorks(@RequestParam limit: Int) = getPopularWorks(monthly(), limit)

    @GetMapping("/popular-works/overall")
    fun getOverallPopularWorks(@RequestParam limit: Int) = getPopularWorks(overall(), limit)

    @GetMapping("/active-users/weekly")
    fun getWeeklyActiveUsers(@RequestParam limit: Int) = getActiveUsers(weekly(), limit)

    @GetMapping("/active-users/monthly")
    fun getMonthlyActiveUsers(@RequestParam limit: Int) = getActiveUsers(monthly(), limit)

    @GetMapping("/active-users/overall")
    fun getOverallActiveUsers(@RequestParam limit: Int) = getActiveUsers(overall(), limit)

    private fun getPopularWorks(range: ChartRange?, limit: Int): GetResponse {
        val items = chartService.getPopularWorks(range, limit)
        return GetResponse(
                title = "인기 작품",
                start = range?.startDate(),
                end = range?.endDate(),
                has_diff = range != null,
                items = items.map { it.map { ChartItemObject(
                        link = "/works/${UrlEscapers.urlPathSegmentEscaper().escape(it.title)}/",
                        text = it.title
                ) } }
        )
    }

    private fun getActiveUsers(range: ChartRange?, limit: Int): GetResponse {
        val items = chartService.getActiveUsers(range, limit)
        return GetResponse(
                title = "활발한 사용자",
                start = range?.startDate(),
                end = range?.endDate(),
                has_diff = range != null,
                items = items.map { it.map { ChartItemObject(
                        link = "/users/${UrlEscapers.urlPathSegmentEscaper().escape(it.username)}/",
                        text = it.username
                ) } }
        )
    }
}