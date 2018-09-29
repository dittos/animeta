package net.animeta.backend.controller.v2

import net.animeta.backend.dto.WorkDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.WorkSerializer
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/works/{id:[0-9]+}")
class WorkController(
    val workRepository: WorkRepository,
    val workSerializer: WorkSerializer
) {
    @GetMapping
    fun get(@PathVariable id: Int, @CurrentUser(required = false) currentUser: User?): WorkDTO {
        val work = workRepository.findById(id).orElseThrow { ApiException.notFound() }
        return workSerializer.serialize(work, currentUser, full = true)
    }
}
