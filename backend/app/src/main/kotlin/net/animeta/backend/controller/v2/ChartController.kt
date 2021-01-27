package net.animeta.backend.controller.v2

import net.animeta.backend.service.ChartService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/charts")
class ChartController(
    private val chartService: ChartService
) {
    @GetMapping("/works/weekly")
    fun getWeeklyWorks(@RequestParam limit: Int) = chartService.getWeeklyWorks(limit)
}
