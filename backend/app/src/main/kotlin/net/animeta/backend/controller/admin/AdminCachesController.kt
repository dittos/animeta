package net.animeta.backend.controller.admin

import net.animeta.backend.controller.v2.TablePeriodController
import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.service.ChartService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/admin/caches")
class AdminCachesController(
    private val chartService: ChartService,
    private val tablePeriodController: TablePeriodController
) {
    @DeleteMapping
    fun clear(@CurrentUser(staffRequired = true) currentUser: User): AdminWorksController.DeleteResponse {
        chartService.invalidateWorkCache()
        tablePeriodController.invalidateCache()
        return AdminWorksController.DeleteResponse(true)
    }
}
